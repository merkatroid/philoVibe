/**
 * Simple embeddings for basic RAG (no external APIs or heavy models).
 *
 * This is a lightweight, deterministic, pure-JS embedding function.
 * It is intentionally simple for bootstrapping.
 *
 * Later you can replace this with a real model (e.g. @xenova/transformers + all-MiniLM-L6-v2
 * or hosted embedding APIs) and just change the dimension + re-ingest.
 *
 * Output dimension: 384 (easy to change).
 */

const EMBEDDING_DIM = 384;

export function getSimpleEmbedding(text: string, dim: number = EMBEDDING_DIM): number[] {
  if (!text || typeof text !== 'string') {
    return new Array(dim).fill(0);
  }

  // Normalize: lowercase, remove most punctuation, split on whitespace
  const normalized = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const tokens = normalized.split(' ').filter((t) => t.length > 1);

  const vec = new Array(dim).fill(0);

  for (const token of tokens) {
    // Simple hash to bucket(s)
    let hash = 2166136261; // FNV offset basis
    for (let i = 0; i < token.length; i++) {
      hash ^= token.charCodeAt(i);
      hash = (hash * 16777619) >>> 0; // FNV prime
    }

    const primaryIdx = hash % dim;
    vec[primaryIdx] += 1.0;

    // Spread to a couple of neighboring buckets for crude "semantic" smoothing
    const neighbor1 = (primaryIdx + 1) % dim;
    const neighbor2 = (primaryIdx + 7) % dim; // larger stride
    const neighbor3 = (primaryIdx + dim - 3) % dim;

    vec[neighbor1] += 0.6;
    vec[neighbor2] += 0.35;
    vec[neighbor3] += 0.25;

    // Add a small signal based on token length (very crude)
    const lenSignal = (token.length % 5) / 10;
    vec[(primaryIdx + 11) % dim] += lenSignal;
  }

  // L2 normalize so cosine similarity works nicely with pgvector
  const magnitude = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0)) || 1;
  return vec.map((v) => v / magnitude);
}

// Convenience alias
export const embed = getSimpleEmbedding;

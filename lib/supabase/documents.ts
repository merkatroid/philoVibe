import { createClient as createServerClient } from './server';
import { getSimpleEmbedding } from '../embeddings';
import type { Database } from './types';

export type DocumentChunk = {
  id: string;
  content: string;
  metadata: any;
  source: string | null;
  philosopher_slug: string | null;
  similarity?: number;
};

/**
 * Retrieve the most relevant document chunks for a query.
 * Uses our simple embedding + the match_documents RPC we created in SQL.
 */
export async function retrieveRelevantDocuments(
  query: string,
  options: {
    limit?: number;
    philosopherSlug?: string;           // filter to a specific philosopher for better RAG
    threshold?: number;
  } = {}
): Promise<DocumentChunk[]> {
  const { limit = 4, philosopherSlug, threshold = 0.05 } = options;

  if (!query || query.trim().length < 3) {
    return [];
  }

  const supabase = await createServerClient();

  const embedding = getSimpleEmbedding(query);

  const filter: Record<string, any> = {};
  if (philosopherSlug) {
    filter.philosopher_slug = philosopherSlug;
  }

  const { data, error } = await (supabase as any).rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: limit,
    filter: filter,
  });

  if (error) {
    console.error('RAG retrieval error:', error);
    return [];
  }

  return (data || []) as DocumentChunk[];
}

/**
 * Simple keyword fallback (used if vector retrieval returns nothing).
 */
export async function retrieveByKeyword(
  query: string,
  philosopherSlug?: string,
  limit = 3
): Promise<DocumentChunk[]> {
  const supabase = await createServerClient();

  let q = supabase
    .from('documents')
    .select('id, content, metadata, source, philosopher_slug')
    .textSearch('content', query, { type: 'plain' }) // requires tsvector or just use ilike for simplicity
    .limit(limit);

  if (philosopherSlug) {
    q = q.eq('philosopher_slug', philosopherSlug);
  }

  const { data, error } = await q;

  if (error || !data) return [];

  return data.map((d) => ({
    ...d,
    similarity: 0.3, // fake low similarity for keyword results
  }));
}

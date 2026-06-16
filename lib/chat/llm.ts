import { createOpenAI } from '@ai-sdk/openai';
import type { LanguageModel } from 'ai';
import { getActiveLlmProvider, getLlmLabel, type LlmProvider } from './personas';

/**
 * Groq production 70B — replaces deprecated `llama-3.1-70b-versatile`.
 * For lowest cost / free tier, set GROQ_MODEL=llama-3.1-8b-instant in env.
 */
export const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile';
export const DEFAULT_OLLAMA_MODEL = 'llama3.1';
export const DEFAULT_OLLAMA_BASE_URL = 'http://localhost:11434/v1';

function normalizeGroqApiKey(raw: string | undefined): string | null {
  if (!raw?.trim()) return null;
  let key = raw.trim();
  // Common copy-paste typo — Groq keys always start with gsk_
  if (key.startsWith('ggsk_')) {
    key = key.replace(/^ggsk_/, 'gsk_');
    console.warn('[llm] Corrected GROQ_API_KEY typo (ggsk_ → gsk_)');
  }
  if (!key.startsWith('gsk_')) {
    console.error('[llm] GROQ_API_KEY has invalid format (expected gsk_...)');
    return null;
  }
  return key;
}

function createGroqClient() {
  const apiKey = normalizeGroqApiKey(process.env.GROQ_API_KEY);
  if (!apiKey) return null;

  return createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey,
  });
}

function createOllamaClient() {
  if (!isOllamaAllowed()) return null;

  return createOpenAI({
    baseURL: process.env.OLLAMA_BASE_URL || DEFAULT_OLLAMA_BASE_URL,
    apiKey: process.env.OLLAMA_API_KEY || 'ollama',
  });
}

/** Ollama is dev/self-hosted only — never default to localhost in production. */
export function isOllamaAllowed(): boolean {
  if (process.env.OLLAMA_ENABLED === 'true') return true;
  if (process.env.OLLAMA_ENABLED === 'false') return false;
  return process.env.NODE_ENV === 'development';
}

export function resolveLlmModel(): {
  model: LanguageModel;
  provider: LlmProvider;
  label: string;
} {
  const forced = process.env.LLM_PROVIDER as LlmProvider | undefined;

  const tryGroq = () => {
    const client = createGroqClient();
    if (!client) return null;
    const modelId = process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL;
    return {
      model: client(modelId),
      provider: 'groq' as const,
      label: modelId,
    };
  };

  const tryOllama = () => {
    const client = createOllamaClient();
    if (!client) return null;
    const modelId = process.env.OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL;
    return {
      model: client(modelId),
      provider: 'ollama' as const,
      label: modelId,
    };
  };

  if (forced === 'groq') {
    const groq = tryGroq();
    if (!groq) {
      throw new Error('LLM_PROVIDER=groq but GROQ_API_KEY is not configured.');
    }
    return groq;
  }

  if (forced === 'ollama') {
    const ollama = tryOllama();
    if (!ollama) {
      throw new Error(
        'LLM_PROVIDER=ollama but Ollama is not available. Enable OLLAMA_ENABLED=true or run in development.'
      );
    }
    return ollama;
  }

  // Default chain: Groq (production) → Ollama (local dev fallback)
  const groq = tryGroq();
  if (groq) return groq;

  const ollama = tryOllama();
  if (ollama) return ollama;

  throw new Error(
    'No LLM configured. Set GROQ_API_KEY for production, or run Ollama locally for development.'
  );
}

export function getConfiguredProviderLabel(): string {
  const provider = getActiveLlmProvider();
  if (!provider) return 'No model configured';
  return getLlmLabel(provider);
}
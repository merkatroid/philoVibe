/**
 * PhiloVibe Supabase - Main Barrel Export
 *
 * We now use the modern @supabase/ssr pattern for full Next.js support.
 *
 * Recommended imports:
 *   import { createClient } from '@/lib/supabase/client';   // Client Components
 *   import { createClient } from '@/lib/supabase/server';   // Server Components / Route Handlers
 *   import { getUser, signInWithPassword } from '@/lib/supabase/auth';
 *
 * Legacy single-client export is kept for backward compatibility.
 */

import { createClient as createJsClient } from '@supabase/supabase-js';
import { Database } from './supabase/types';

// Re-export everything important
export type { Database, Philosopher, PhilosopherInsert } from './supabase/types';
export { createClient as createBrowserClient } from './supabase/client';
export { createClient as createServerClient, createServiceClient } from './supabase/server';
export {
  signInWithPassword,
  signUp,
  signOut,
  signInWithMagicLink,
  getUser,
  getSession,
} from './supabase/auth';

export { getPhilosophers, getPhilosopherById, getPhilosopherFilterOptions } from './supabase/philosophers';
export { retrieveRelevantDocuments, retrieveByKeyword } from './supabase/documents';
export { getSimpleEmbedding, embed } from './embeddings';

// ------------------------------------------------------------------
// Legacy single-instance client (browser only, anon key)
// Kept for any old code. Prefer the new createBrowserClient() instead.
// ------------------------------------------------------------------
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    console.warn(
      '⚠️ Supabase env vars not set. Add them to .env.local (NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY)'
    );
  }
}

export const supabase = createJsClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

// Convenience re-exports for quick access
export { createClient } from './supabase/client';
export { createClient as createServerClientLegacy } from './supabase/server';

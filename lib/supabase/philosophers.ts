import { createClient as createBrowserClient } from './client';
import type { Database } from './types';

export type Philosopher = Database['public']['Tables']['philosophers']['Row'];

// For client-side usage (Encyclopedia grid, etc.). Server routes use lib/supabase/server directly.
function getSupabaseClient() {
  return createBrowserClient();
}

export interface PhilosopherFilters {
  search?: string;
  era?: string;              // e.g. 'Ancient', 'Contemporary'
  tradition?: string;        // e.g. 'Analytic', 'Continental', 'Eastern'
  status?: 'historical' | 'contemporary' | 'obscure' | 'all';
  limit?: number;
  offset?: number;
}

/**
 * Fetch philosophers with filters, search, and pagination for the Encyclopedia.
 * Supports infinite scroll via offset/limit.
 */
export async function getPhilosophers(
  filters: PhilosopherFilters = {}
): Promise<Philosopher[]> {
  const {
    search,
    era,
    tradition,
    status = 'all',
    limit = 50,
    offset = 0,
  } = filters;

  const supabase = getSupabaseClient();

  let query = supabase
    .from('philosophers')
    .select('*')
    .order('name', { ascending: true })
    .range(offset, offset + limit - 1);

  if (search) {
    const term = `%${search}%`;
    query = query.or(`name.ilike.${term},bio_summary.ilike.${term},school_tradition.ilike.${term}`);
  }

  if (era && era !== 'all') {
    query = query.eq('era', era);
  }

  if (tradition && tradition !== 'all') {
    query = query.ilike('school_tradition', `%${tradition}%`);
  }

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching philosophers:', error);
    return [];
  }

  return data ?? [];
}

/**
 * Get distinct eras and traditions for filter dropdowns (client can cache).
 */
export async function getPhilosopherFilterOptions() {
  const supabase = getSupabaseClient();

  const { data: erasData } = await supabase
    .from('philosophers')
    .select('era')
    .not('era', 'is', null);

  const { data: traditionsData } = await supabase
    .from('philosophers')
    .select('school_tradition')
    .not('school_tradition', 'is', null);

  const eras = Array.from(new Set((erasData || []).map((d) => d.era).filter(Boolean))).sort();
  const traditions = Array.from(
    new Set(
      (traditionsData || [])
        .map((d) => d.school_tradition)
        .filter(Boolean)
        .flatMap((t) => t.split(/[,/]/).map((s) => s.trim()))
    )
  ).sort();

  return { eras, traditions };
}

export async function getPhilosopherById(id: string): Promise<Philosopher | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('philosophers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching philosopher ${id}:`, error);
    return null;
  }

  return data;
}

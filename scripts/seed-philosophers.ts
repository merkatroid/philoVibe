/**
 * PhiloVibe — Philosophers Table Seed Script
 *
 * Usage:
 *   1. Make sure you have created the table in Supabase (SQL below).
 *   2. Add SUPABASE_SERVICE_ROLE_KEY to .env.local
 *   3. Run: npm run db:seed:philosophers
 *
 * Recommended table definition (run this in Supabase SQL Editor first):
 *
 * create table if not exists public.philosophers (
 *   id uuid primary key default gen_random_uuid(),
 *   slug text unique not null,
 *   name text not null,
 *   era text,
 *   bio text,
 *   quote text,
 *   image_url text,
 *   metadata jsonb,
 *   created_at timestamptz default now()
 * );
 *
 * -- Recommended for future RAG / semantic search:
 * -- alter table public.philosophers add column if not exists embedding vector(1536);
 * -- create index if not exists philosophers_embedding_idx on public.philosophers using ivfflat (embedding vector_cosine_ops);
 *
 * -- RLS example (public read-only for now):
 * alter table public.philosophers enable row level security;
 * create policy "Philosophers are publicly readable"
 *   on public.philosophers for select
 *   using (true);
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../lib/supabase/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials.');
  console.error('   Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const philosophers = [
  {
    slug: 'socrates',
    name: 'Socrates',
    era: 'c. 470 – 399 BCE',
    bio: 'Classical Greek philosopher. Credited as the founder of Western philosophy and the Socratic method.',
    quote: 'The unexamined life is not worth living.',
    metadata: { school: 'Classical', region: 'Athens' },
  },
  {
    slug: 'plato',
    name: 'Plato',
    era: 'c. 428 – 348 BCE',
    bio: 'Student of Socrates. Founded the Academy. Author of The Republic and the theory of Forms.',
    quote: 'The beginning is the most important part of the work.',
    metadata: { school: 'Platonism', region: 'Athens' },
  },
  {
    slug: 'aristotle',
    name: 'Aristotle',
    era: '384 – 322 BCE',
    bio: 'Student of Plato, tutor to Alexander the Great. Founded the Lyceum. Father of logic, ethics, and biology.',
    quote: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
    metadata: { school: 'Peripatetic', region: 'Athens' },
  },
  {
    slug: 'epictetus',
    name: 'Epictetus',
    era: 'c. 50 – 135 CE',
    bio: 'Former slave turned Stoic teacher. Emphasized the dichotomy of control.',
    quote: 'It\'s not what happens to you, but how you react to it that matters.',
    metadata: { school: 'Stoicism', region: 'Greece/Rome' },
  },
  {
    slug: 'marcus-aurelius',
    name: 'Marcus Aurelius',
    era: '121 – 180 CE',
    bio: 'Roman Emperor and Stoic philosopher. His private notes became the Meditations.',
    quote: 'You have power over your mind — not outside events. Realize this, and you will find strength.',
    metadata: { school: 'Stoicism', region: 'Rome' },
  },
  {
    slug: 'nietzsche',
    name: 'Friedrich Nietzsche',
    era: '1844 – 1900',
    bio: 'German philosopher, cultural critic, and poet. Famous for ideas of the Übermensch, eternal recurrence, and the death of God.',
    quote: 'He who has a why to live can bear almost any how.',
    metadata: { school: 'Existentialism / Nihilism critique', region: 'Germany' },
  },
  {
    slug: 'simone-de-beauvoir',
    name: 'Simone de Beauvoir',
    era: '1908 – 1986',
    bio: 'French existentialist philosopher, writer, and feminist. Author of The Second Sex.',
    quote: 'One is not born, but rather becomes, a woman.',
    metadata: { school: 'Existentialism', region: 'France' },
  },
  {
    slug: 'hypatia',
    name: 'Hypatia of Alexandria',
    era: 'c. 370 – 415 CE',
    bio: 'Neoplatonist philosopher, astronomer, and mathematician. One of the earliest recorded female mathematicians and philosophers.',
    quote: 'Reserve your right to think, for even to think wrongly is better than not to think at all.',
    metadata: { school: 'Neoplatonism', region: 'Alexandria' },
  },
];

async function main() {
  console.log('🌱 Seeding philosophers table...');

  const { data, error } = await supabase
    .from('philosophers')
    .upsert(philosophers, { onConflict: 'slug' })
    .select('slug, name');

  if (error) {
    console.error('❌ Seed failed:', error.message);
    console.error('   Did you create the "philosophers" table in Supabase first? See comments at top of this file.');
    process.exit(1);
  }

  console.log('✅ Successfully seeded philosophers:');
  data?.forEach((p) => console.log(`   - ${p.name} (${p.slug})`));
  console.log('\nYou can now query this table from your app using the Supabase clients.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

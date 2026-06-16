-- PhiloVibe Philosophers Database (expanded for Encyclopedia)
-- Run this in Supabase SQL Editor after previous migrations.

create table if not exists public.philosophers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  birth_death text,                    -- e.g. "(384-322 BCE)" or "(1949-)"
  school_tradition text,               -- e.g. "Aristotelianism", "Existentialism", "Analytic", "Eastern (Confucianism)"
  bio_summary text,                    -- short neutral summary (especially for contemporaries)
  key_ideas text[],                    -- array of key ideas
  public_domain_works text,            -- list or "See Project Gutenberg / links" ; empty for contemporary
  status text not null default 'historical' check (status in ('historical', 'contemporary', 'obscure')),
  wikipedia_slug text,                 -- e.g. "Plato" for https://en.wikipedia.org/wiki/Plato
  sep_link text,                       -- Stanford Encyclopedia link
  era text,                            -- 'Ancient', 'Medieval', 'Renaissance', 'Early Modern', '19th Century', '20th Century', 'Contemporary'
  created_at timestamptz default now()
);

-- Indexes for search and filters
create index if not exists philosophers_name_idx on public.philosophers using gin (name gin_trgm_ops);
create index if not exists philosophers_status_idx on public.philosophers (status);
create index if not exists philosophers_era_idx on public.philosophers (era);
create index if not exists philosophers_school_idx on public.philosophers using gin (school_tradition gin_trgm_ops);

-- RLS: public readable (for encyclopedia browsing)
alter table public.philosophers enable row level security;

create policy "Philosophers are publicly readable for browsing"
  on public.philosophers
  for select
  using (true);

-- Note: Future: community contributions + verified bios (users can suggest via form, admins verify and insert).

-- Example insert structure (used by seed script):
-- INSERT INTO philosophers (name, birth_death, school_tradition, bio_summary, key_ideas, public_domain_works, status, wikipedia_slug, sep_link, era)
-- VALUES ('Plato', '(c. 427 – c. 347 BCE)', 'Platonism', 'Ancient Greek philosopher, student of Socrates...', ARRAY['Theory of Forms', 'Ideal State'], 'The Republic, Symposium (public domain)', 'historical', 'Plato', 'https://plato.stanford.edu/entries/plato/', 'Ancient');
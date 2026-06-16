-- Basic RAG documents table for PhiloVibe (simple embeddings)
-- Run after enabling pgvector.

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  embedding vector(384) not null,   -- 384 dim for our simple embedding (or swap to 1536 later)
  metadata jsonb default '{}',
  source text,
  philosopher_slug text,            -- e.g. 'socrates', 'nietzsche' for persona filtering
  created_at timestamptz default now()
);

-- Recommended index for cosine similarity (IVFFlat is good starting point)
create index if not exists documents_embedding_idx
  on public.documents
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Optional: allow public read (we can tighten with RLS later)
alter table public.documents enable row level security;

-- Public read policy (safe for philosophy texts)
create policy "Documents are publicly readable"
  on public.documents
  for select
  using (true);

-- === Helper function for semantic retrieval ===
create or replace function public.match_documents(
  query_embedding vector(384),
  match_threshold float default 0.05,
  match_count int default 5,
  filter jsonb default '{}'
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  source text,
  philosopher_slug text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    d.id,
    d.content,
    d.metadata,
    d.source,
    d.philosopher_slug,
    1 - (d.embedding <=> query_embedding) as similarity
  from public.documents d
  where 
    (filter = '{}'::jsonb or d.metadata @> filter or d.philosopher_slug = (filter->>'philosopher_slug'))
    and 1 - (d.embedding <=> query_embedding) > match_threshold
  order by d.embedding <=> query_embedding
  limit match_count;
end;
$$;

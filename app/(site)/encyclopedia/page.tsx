'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  Filter,
  ExternalLink,
  MessageCircle,
  Sparkles,
  X,
  Library,
} from 'lucide-react';
import {
  getPhilosophers,
  getPhilosopherFilterOptions,
  type Philosopher,
} from '@/lib/supabase/philosophers';
import { getChatHref } from '@/lib/chat/personas';
import { cn } from '@/lib/utils';

type PhilosopherStatus = 'historical' | 'contemporary' | 'obscure';

type EncyclopediaEntry = Philosopher & {
  slug: string;
  emoji: string;
  portraitUrl?: string;
};

const STATIC_PHILOSOPHERS: EncyclopediaEntry[] = [
  {
    id: 'static-plato',
    name: 'Plato',
    slug: 'plato',
    emoji: '🏛️',
    birth_death: '428–348 BCE',
    era: 'Ancient',
    school_tradition: 'Platonism',
    bio_summary:
      'Student of Socrates and founder of the Academy. His dialogues shaped Western metaphysics, ethics, and political theory through the theory of Forms.',
    key_ideas: ['Theory of Forms', 'Philosopher-king', 'Allegory of the Cave'],
    status: 'historical',
    wikipedia_slug: 'Plato',
    sep_link: 'https://plato.stanford.edu/entries/plato/',
    public_domain_works: 'Republic, Symposium, Phaedo',
    created_at: new Date(0).toISOString(),
    portraitUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Plato_Silanion_Musei_Capitolini_MC1377.jpg/220px-Plato_Silanion_Musei_Capitolini_MC1377.jpg',
  },
  {
    id: 'static-aristotle',
    name: 'Aristotle',
    slug: 'aristotle',
    emoji: '📚',
    birth_death: '384–322 BCE',
    era: 'Ancient',
    school_tradition: 'Aristotelianism',
    bio_summary:
      'Polymath of the Lyceum who systematized logic, biology, ethics, and politics. Teacher of Alexander the Great and critic of Platonic Forms.',
    key_ideas: ['Golden mean', 'Four causes', 'Syllogistic logic'],
    status: 'historical',
    wikipedia_slug: 'Aristotle',
    sep_link: 'https://plato.stanford.edu/entries/aristotle/',
    public_domain_works: 'Nicomachean Ethics, Politics, Metaphysics',
    created_at: new Date(0).toISOString(),
    portraitUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Aristotle_Altemps_Inv8575.jpg/220px-Aristotle_Altemps_Inv8575.jpg',
  },
  {
    id: 'static-socrates',
    name: 'Socrates',
    slug: 'socrates',
    emoji: '🦉',
    birth_death: 'c. 470–399 BCE',
    era: 'Ancient',
    school_tradition: 'Socratic method',
    bio_summary:
      'Athenian gadfly who pursued wisdom through relentless questioning. Executed for impiety, he left no writings — only the memory of his students.',
    key_ideas: ['Know thyself', 'Elenchus', 'Virtue is knowledge'],
    status: 'historical',
    wikipedia_slug: 'Socrates',
    sep_link: 'https://plato.stanford.edu/entries/socrates/',
    public_domain_works: null,
    created_at: new Date(0).toISOString(),
  },
  {
    id: 'static-hypatia',
    name: 'Hypatia',
    slug: 'hypatia',
    emoji: '✨',
    birth_death: 'c. 360–415 CE',
    era: 'Late Antique',
    school_tradition: 'Neoplatonism',
    bio_summary:
      'Alexandrian mathematician, astronomer, and philosopher. A rare documented woman of ancient philosophy who led the Platonic school in Alexandria.',
    key_ideas: ['Neoplatonic synthesis', 'Mathematical cosmology', 'Rational inquiry'],
    status: 'historical',
    wikipedia_slug: 'Hypatia',
    sep_link: null,
    public_domain_works: null,
    created_at: new Date(0).toISOString(),
  },
  {
    id: 'static-ibn-sina',
    name: 'Ibn Sina (Avicenna)',
    slug: 'ibn-sina',
    emoji: '🌙',
    birth_death: '980–1037',
    era: 'Medieval',
    school_tradition: 'Islamic Peripatetic',
    bio_summary:
      'Persian polymath whose Canon of Medicine and metaphysics bridged Aristotle and Islamic theology. Developed the famous "flying man" thought experiment.',
    key_ideas: ['Essence and existence', 'Flying man argument', 'Active intellect'],
    status: 'historical',
    wikipedia_slug: 'Avicenna',
    sep_link: 'https://plato.stanford.edu/entries/ibn-sina/',
    public_domain_works: null,
    created_at: new Date(0).toISOString(),
  },
  {
    id: 'static-zhu-xi',
    name: 'Zhu Xi',
    slug: 'zhu-xi',
    emoji: '🎋',
    birth_death: '1130–1200',
    era: 'Medieval',
    school_tradition: 'Neo-Confucianism',
    bio_summary:
      'Song dynasty synthesizer of Confucian thought who made li (principle) and qi (vital force) central to East Asian philosophy for centuries.',
    key_ideas: ['Li and qi', 'Investigation of things', 'Moral cultivation'],
    status: 'historical',
    wikipedia_slug: 'Zhu_Xi',
    sep_link: 'https://plato.stanford.edu/entries/zhu-xi/',
    public_domain_works: null,
    created_at: new Date(0).toISOString(),
  },
  {
    id: 'static-anaximander',
    name: 'Anaximander',
    slug: 'anaximander',
    emoji: '🌊',
    birth_death: 'c. 610–546 BCE',
    era: 'Ancient',
    school_tradition: 'Pre-Socratic',
    bio_summary:
      'Milesian thinker who proposed the apeiron — an indefinite boundless principle — as the origin of all things, pioneering cosmological speculation.',
    key_ideas: ['The apeiron', 'Cosmic cycles', 'Cartography'],
    status: 'obscure',
    wikipedia_slug: 'Anaximander',
    sep_link: 'https://plato.stanford.edu/entries/anaximander/',
    public_domain_works: null,
    created_at: new Date(0).toISOString(),
  },
  {
    id: 'static-diogenes',
    name: 'Diogenes of Sinope',
    slug: 'diogenes',
    emoji: '🏺',
    birth_death: 'c. 404–323 BCE',
    era: 'Ancient',
    school_tradition: 'Cynicism',
    bio_summary:
      'Radical ascetic who lived in a jar and mocked convention. Searched with a lamp in daylight for an honest man — emblem of philosophical provocation.',
    key_ideas: ['Living according to nature', 'Cosmopolitanism', 'Ascetic virtue'],
    status: 'obscure',
    wikipedia_slug: 'Diogenes',
    sep_link: 'https://plato.stanford.edu/entries/diogenes-cynic/',
    public_domain_works: null,
    created_at: new Date(0).toISOString(),
  },
  {
    id: 'static-marcus-aurelius',
    name: 'Marcus Aurelius',
    slug: 'marcus-aurelius',
    emoji: '🛡️',
    birth_death: '121–180 CE',
    era: 'Imperial',
    school_tradition: 'Stoicism',
    bio_summary:
      'Roman emperor whose private Meditations distill Stoic discipline: accept what you cannot control, act with virtue, see the cosmos as one.',
    key_ideas: ['Dichotomy of control', 'Memento mori', 'Cosmic perspective'],
    status: 'historical',
    wikipedia_slug: 'Marcus_Aurelius',
    sep_link: 'https://plato.stanford.edu/entries/marcus-aurelius/',
    public_domain_works: 'Meditations',
    created_at: new Date(0).toISOString(),
    portraitUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Marco_Aurelio_Bronzo.jpg/220px-Marco_Aurelio_Bronzo.jpg',
  },
  {
    id: 'static-nietzsche',
    name: 'Friedrich Nietzsche',
    slug: 'nietzsche',
    emoji: '⚡',
    birth_death: '1844–1900',
    era: '19th Century',
    school_tradition: 'Continental',
    bio_summary:
      'German critic of morality and metaphysics who proclaimed the death of God, the will to power, and eternal recurrence — a hammer against idols.',
    key_ideas: ['Will to power', 'Übermensch', 'Eternal recurrence'],
    status: 'historical',
    wikipedia_slug: 'Friedrich_Nietzsche',
    sep_link: 'https://plato.stanford.edu/entries/nietzsche/',
    public_domain_works: 'Thus Spoke Zarathustra, Beyond Good and Evil',
    created_at: new Date(0).toISOString(),
    portraitUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Nietzsche187a.jpg/220px-Nietzsche187a.jpg',
  },
  {
    id: 'static-de-beauvoir',
    name: 'Simone de Beauvoir',
    slug: 'simone-de-beauvoir',
    emoji: '✍️',
    birth_death: '1908–1986',
    era: '20th Century',
    school_tradition: 'Existentialism',
    bio_summary:
      'French existentialist and feminist whose The Second Sex argued that one is not born but becomes a woman — a landmark of gender philosophy.',
    key_ideas: ['Situated freedom', 'The Other', 'Ethics of ambiguity'],
    status: 'historical',
    wikipedia_slug: 'Simone_de_Beauvoir',
    sep_link: 'https://plato.stanford.edu/entries/beauvoir/',
    public_domain_works: null,
    created_at: new Date(0).toISOString(),
  },
  {
    id: 'static-judith-butler',
    name: 'Judith Butler',
    slug: 'judith-butler',
    emoji: '🎭',
    birth_death: '1956–present',
    era: 'Contemporary',
    school_tradition: 'Poststructuralism',
    bio_summary:
      'Leading theorist of gender performativity and precarity. Their work reshaped feminist, queer, and political philosophy in the late 20th century.',
    key_ideas: ['Gender performativity', 'Precarity', 'Bodies that matter'],
    status: 'contemporary',
    wikipedia_slug: 'Judith_Butler',
    sep_link: null,
    public_domain_works: null,
    created_at: new Date(0).toISOString(),
  },
  {
    id: 'static-cornel-west',
    name: 'Cornel West',
    slug: 'cornel-west',
    emoji: '🎺',
    birth_death: '1953–present',
    era: 'Contemporary',
    school_tradition: 'Pragmatism',
    bio_summary:
      'Public philosopher of democracy, race, and prophetic pragmatism. Combines American pragmatism with liberation theology and jazz sensibility.',
    key_ideas: ['Prophetic pragmatism', 'Race and democracy', 'Courage to love'],
    status: 'contemporary',
    wikipedia_slug: 'Cornel_West',
    sep_link: null,
    public_domain_works: null,
    created_at: new Date(0).toISOString(),
  },
  {
    id: 'static-angela-davis',
    name: 'Angela Davis',
    slug: 'angela-davis',
    emoji: '✊',
    birth_death: '1944–present',
    era: 'Contemporary',
    school_tradition: 'Critical Theory',
    bio_summary:
      'Scholar-activist whose work on prisons, abolition, and intersectionality links Marxist theory to Black feminist liberation struggles.',
    key_ideas: ['Prison abolition', 'Intersectionality', 'Freedom is a constant struggle'],
    status: 'contemporary',
    wikipedia_slug: 'Angela_Davis',
    sep_link: null,
    public_domain_works: null,
    created_at: new Date(0).toISOString(),
  },
  {
    id: 'static-graham-priest',
    name: 'Graham Priest',
    slug: 'graham-priest',
    emoji: '∞',
    birth_death: '1948–present',
    era: 'Contemporary',
    school_tradition: 'Analytic',
    bio_summary:
      'Distinguished logician and advocate of dialetheism — the view that some contradictions can be true. Bridges analytic logic and Eastern philosophy.',
    key_ideas: ['Dialetheism', 'Paraconsistent logic', 'Buddhist metaphysics'],
    status: 'contemporary',
    wikipedia_slug: 'Graham_Priest',
    sep_link: null,
    public_domain_works: null,
    created_at: new Date(0).toISOString(),
  },
];

const SUPABASE_TIMEOUT_MS = 4500;

function deriveFilterOptions(entries: EncyclopediaEntry[]) {
  const eras = Array.from(
    new Set(entries.map((p) => p.era).filter((e): e is string => Boolean(e)))
  ).sort();

  const traditions = Array.from(
    new Set(
      entries
        .map((p) => p.school_tradition)
        .filter((t): t is string => Boolean(t))
        .flatMap((t) => t.split(/[,/]/).map((s) => s.trim()))
    )
  ).sort();

  return { eras, traditions };
}

function statusBadgeClass(status: PhilosopherStatus) {
  switch (status) {
    case 'contemporary':
      return 'bg-emerald-950/60 text-emerald-300 ring-emerald-800/60';
    case 'obscure':
      return 'bg-rose-950/50 text-rose-300 ring-rose-900/50';
    default:
      return 'bg-zinc-800/80 text-zinc-300 ring-zinc-700/60';
  }
}

function PhilosopherPortrait({
  entry,
  failedUrls,
  onPortraitError,
}: {
  entry: EncyclopediaEntry;
  failedUrls: Set<string>;
  onPortraitError: (url: string) => void;
}) {
  const showPortrait = entry.portraitUrl && !failedUrls.has(entry.portraitUrl);

  return (
    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl ring-1 ring-inset ring-zinc-700/80 shadow-lg shadow-black/30 transition-all duration-300 group-hover:ring-amber-500/40 group-hover:shadow-amber-950/20">
      {showPortrait ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={entry.portraitUrl}
          alt={`Portrait of ${entry.name}`}
          className="h-full w-full object-cover object-top"
          onError={() => onPortraitError(entry.portraitUrl!)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 via-zinc-900 to-amber-950/40 text-2xl">
          {entry.emoji}
        </div>
      )}
    </div>
  );
}

function PhilosopherEncyclopediaCard({
  entry,
  failedUrls,
  onPortraitError,
}: {
  entry: EncyclopediaEntry;
  failedUrls: Set<string>;
  onPortraitError: (url: string) => void;
}) {
  const firstName = entry.name.split(' ')[0];

  return (
    <article
      className={cn(
        'group card relative flex flex-col overflow-hidden rounded-2xl p-6',
        'bg-gradient-to-b from-zinc-900/90 to-zinc-950/95',
        'shadow-[0_4px_24px_-4px_rgba(0,0,0,0.45)]',
        'hover:shadow-[0_12px_40px_-8px_rgba(245,158,11,0.12)]',
        'hover:border-amber-700/30'
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5 min-w-0">
          <PhilosopherPortrait
            entry={entry}
            failedUrls={failedUrls}
            onPortraitError={onPortraitError}
          />
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-xl tracking-tight text-zinc-100 transition-colors group-hover:text-amber-300">
              {entry.name}
            </h3>
            <p className="mt-0.5 text-sm text-amber-400/85 font-mono tracking-tight">
              {entry.birth_death || 'Dates unknown'}
            </p>
          </div>
        </div>
        <span
          className={cn(
            'flex-shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ring-1',
            statusBadgeClass(entry.status)
          )}
        >
          {entry.status}
        </span>
      </div>

      {entry.era && (
        <div className="mb-3">
          <span className="inline-flex items-center rounded-full border border-zinc-700/80 bg-zinc-900/60 px-2.5 py-0.5 text-[11px] uppercase tracking-[0.12em] text-zinc-400">
            {entry.era}
          </span>
        </div>
      )}

      <p className="mb-4 flex-1 text-[15px] leading-relaxed text-zinc-300/95 line-clamp-4">
        {entry.bio_summary || 'No summary available.'}
      </p>

      {entry.school_tradition && (
        <p className="mb-3 text-sm">
          <span className="text-zinc-500">Tradition · </span>
          <span className="text-amber-300/90">{entry.school_tradition}</span>
        </p>
      )}

      {entry.key_ideas && entry.key_ideas.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {entry.key_ideas.slice(0, 3).map((idea) => (
            <span
              key={idea}
              className="rounded-md border border-zinc-800 bg-zinc-950/60 px-2 py-0.5 text-[11px] text-zinc-400"
            >
              {idea}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto space-y-3 border-t border-zinc-800/80 pt-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {entry.wikipedia_slug && (
            <a
              href={`https://en.wikipedia.org/wiki/${entry.wikipedia_slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-amber-400/90 transition-colors hover:text-amber-300"
            >
              Wikipedia <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {entry.sep_link && (
            <a
              href={entry.sep_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-amber-400/90 transition-colors hover:text-amber-300"
            >
              SEP <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {entry.public_domain_works && (
            <span className="text-emerald-400/75">Public domain works</span>
          )}
        </div>

        <Link
          href={getChatHref(entry.slug, entry.name)}
          className="btn btn-primary w-full rounded-xl py-2.5 text-sm font-medium shadow-md shadow-amber-950/30 transition-all hover:shadow-lg hover:shadow-amber-900/25 active:scale-[0.99]"
        >
          <MessageCircle className="h-4 w-4" />
          Chat with {firstName}
        </Link>
      </div>
    </article>
  );
}

export default function EncyclopediaPage() {
  const staticOptions = useMemo(() => deriveFilterOptions(STATIC_PHILOSOPHERS), []);

  const [philosophers, setPhilosophers] = useState<EncyclopediaEntry[]>(STATIC_PHILOSOPHERS);
  const [eras, setEras] = useState<string[]>(['all', ...staticOptions.eras]);
  const [traditions, setTraditions] = useState<string[]>(['all', ...staticOptions.traditions]);
  const [dataSource, setDataSource] = useState<'static' | 'supabase'>('static');
  const [isSyncing, setIsSyncing] = useState(false);
  const [failedPortraitUrls, setFailedPortraitUrls] = useState<Set<string>>(new Set());

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEra, setSelectedEra] = useState('all');
  const [selectedTradition, setSelectedTradition] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | PhilosopherStatus>('all');

  const handlePortraitError = useCallback((url: string) => {
    setFailedPortraitUrls((prev) => new Set(prev).add(url));
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadFromSupabase = async () => {
      setIsSyncing(true);

      try {
        const supabasePromise = Promise.all([
          getPhilosophers({ limit: 1000 }),
          getPhilosopherFilterOptions(),
        ]);

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Supabase request timed out')), SUPABASE_TIMEOUT_MS);
        });

        const [remoteData, options] = await Promise.race([supabasePromise, timeoutPromise]);

        if (cancelled) return;

        if (remoteData.length > 0) {
          const enriched: EncyclopediaEntry[] = remoteData.map((p) => ({
            ...p,
            slug: p.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, ''),
            emoji: '📜',
          }));

          setPhilosophers(enriched);
          setEras(['all', ...options.eras]);
          setTraditions(['all', ...options.traditions]);
          setDataSource('supabase');
        }
      } catch (error) {
        if (!cancelled) {
          console.warn('Using static encyclopedia fallback:', error);
          setPhilosophers(STATIC_PHILOSOPHERS);
          setEras(['all', ...staticOptions.eras]);
          setTraditions(['all', ...staticOptions.traditions]);
          setDataSource('static');
        }
      } finally {
        if (!cancelled) setIsSyncing(false);
      }
    };

    loadFromSupabase();

    return () => {
      cancelled = true;
    };
  }, [staticOptions.eras, staticOptions.traditions]);

  const filteredPhilosophers = useMemo(() => {
    let result = [...philosophers];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          (p.bio_summary ?? '').toLowerCase().includes(term) ||
          (p.school_tradition ?? '').toLowerCase().includes(term) ||
          (p.era ?? '').toLowerCase().includes(term) ||
          (p.key_ideas ?? []).some((idea) => idea.toLowerCase().includes(term))
      );
    }

    if (selectedEra !== 'all') {
      result = result.filter((p) => p.era === selectedEra);
    }

    if (selectedTradition !== 'all') {
      result = result.filter(
        (p) =>
          p.school_tradition &&
          p.school_tradition.toLowerCase().includes(selectedTradition.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      result = result.filter((p) => p.status === selectedStatus);
    }

    return result;
  }, [philosophers, searchTerm, selectedEra, selectedTradition, selectedStatus]);

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    selectedEra !== 'all' ||
    selectedTradition !== 'all' ||
    selectedStatus !== 'all';

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedEra('all');
    setSelectedTradition('all');
    setSelectedStatus('all');
  };

  const statusChips: { value: 'all' | PhilosopherStatus; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'historical', label: 'Historical' },
    { value: 'contemporary', label: 'Living' },
    { value: 'obscure', label: 'Obscure' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/10 ring-1 ring-amber-500/25">
            <BookOpen className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-amber-400/90 font-medium">
              PhiloVibe Reference
            </p>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-[-2px] text-white">
              Encyclopedia
            </h1>
          </div>
        </div>

        <p className="max-w-2xl text-lg leading-relaxed text-zinc-400">
          A living, searchable reference of thinkers across eras and traditions — from
          pre-Socratic mysteries to contemporary voices shaping how we live and argue today.
        </p>

        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1">
            <Library className="h-3.5 w-3.5 text-amber-500/80" />
            {philosophers.length} thinkers catalogued
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-500/80" />
            {dataSource === 'supabase' ? 'Live from Supabase' : 'Curated fallback library'}
            {isSyncing && ' · syncing…'}
          </span>
        </div>
      </header>

      {/* Search & Filters */}
      <div className="sticky top-0 z-40 -mx-1 rounded-2xl border border-zinc-800/80 bg-zinc-950/90 px-4 py-4 backdrop-blur-md shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] md:top-2">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, ideas, tradition, or era…"
              className="search-input w-full rounded-2xl py-3 pl-11 pr-10 text-base focus-ring"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedEra}
              onChange={(e) => setSelectedEra(e.target.value)}
              className="persona-select rounded-xl px-3.5 py-2.5 text-sm focus-ring"
              aria-label="Filter by era"
            >
              {eras.map((era) => (
                <option key={era} value={era}>
                  {era === 'all' ? 'All eras' : era}
                </option>
              ))}
            </select>

            <select
              value={selectedTradition}
              onChange={(e) => setSelectedTradition(e.target.value)}
              className="persona-select rounded-xl px-3.5 py-2.5 text-sm focus-ring"
              aria-label="Filter by tradition"
            >
              {traditions.map((t) => (
                <option key={t} value={t}>
                  {t === 'all' ? 'All traditions' : t}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="btn btn-ghost rounded-xl border border-zinc-800 px-3 py-2 text-xs"
              >
                <Filter className="h-3.5 w-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {statusChips.map((chip) => (
            <button
              key={chip.value}
              type="button"
              onClick={() => setSelectedStatus(chip.value)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-medium transition-all',
                selectedStatus === chip.value
                  ? 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/40'
                  : 'border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <p className="mt-3 text-xs text-zinc-500">
          Showing {filteredPhilosophers.length} of {philosophers.length} philosophers
        </p>
      </div>

      {/* Grid */}
      {filteredPhilosophers.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredPhilosophers.map((entry) => (
            <PhilosopherEncyclopediaCard
              key={entry.id}
              entry={entry}
              failedUrls={failedPortraitUrls}
              onPortraitError={handlePortraitError}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-16 text-center">
          <p className="text-lg text-zinc-400">No philosophers match your filters.</p>
          <button
            type="button"
            onClick={resetFilters}
            className="btn btn-secondary mt-4 rounded-xl px-5 py-2.5"
          >
            Clear all filters
          </button>
        </div>
      )}

      <footer className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 text-sm leading-relaxed text-zinc-400">
        <strong className="text-zinc-300">Sources & ethics:</strong> Historical and obscure
        entries draw on public-domain scholarship. Contemporary philosophers appear with short
        neutral summaries and links to Wikipedia or the Stanford Encyclopedia of Philosophy —
        never full copyrighted biographies.
      </footer>
    </div>
  );
}
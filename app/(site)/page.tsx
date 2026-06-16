'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, BookOpen } from 'lucide-react';
import { PhilosopherCard } from '@/components/PhilosopherCard';
import { cn } from '@/lib/utils';

const featuredPhilosophers = [
  {
    name: 'Socrates',
    era: 'c. 470 – 399 BCE • Athens',
    quote: 'The unexamined life is not worth living.',
    slug: 'socrates',
  },
  {
    name: 'Friedrich Nietzsche',
    era: '1844 – 1900 • Germany',
    quote: 'He who has a why to live can bear almost any how.',
    slug: 'nietzsche',
  },
  {
    name: 'Marcus Aurelius',
    era: '121 – 180 CE • Rome',
    quote: 'You have power over your mind — not outside events.',
    slug: 'marcus-aurelius',
  },
  {
    name: 'Simone de Beauvoir',
    era: '1908 – 1986 • France',
    quote: 'One is not born, but rather becomes, a woman.',
    slug: 'simone-de-beauvoir',
  },
];

const quickSearches = [
  'What is the good life?',
  'On suffering and meaning',
  'Freedom and responsibility',
  'Virtue in an unjust world',
];

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const filteredPhilosophers = featuredPhilosophers.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.era.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.quote.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuickSearch = (query: string) => {
    // Navigate to chat with a nice starter prompt prefilled via query param (handled in chat page)
    window.location.href = `/chat?prompt=${encodeURIComponent(query)}`;
  };

  return (
    <div className="space-y-14">
      {/* Hero */}
      <div className="pt-6 pb-4">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs tracking-[2px] text-amber-400 mb-6">
            EST. 399 BCE — REIMAGINED FOR 2026
          </div>
          
          <h1 className="text-6xl md:text-7xl font-semibold tracking-[-3.2px] leading-[0.92] text-white">
            Philosophy.<br />In conversation.
          </h1>
          <p className="mt-5 max-w-lg text-2xl tracking-tight text-zinc-400">
            Meet history’s greatest minds. Ask deep questions. 
            Receive answers rooted in primary texts.
          </p>
        </div>

        {/* Quick Search Bar */}
        <div className="mt-9 max-w-2xl">
          <div className="relative">
            <div className="absolute left-5 top-4 text-zinc-500">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
              placeholder="Search philosophers, ideas, or begin a question…"
              className="search-input w-full rounded-2xl pl-12 pr-5 py-4 text-lg placeholder:text-zinc-500 focus-ring"
            />
          </div>

          {/* Quick suggestion pills */}
          <div className="mt-3 flex flex-wrap gap-2">
            {quickSearches.map((q, i) => (
              <button
                key={i}
                onClick={() => handleQuickSearch(q)}
                className="text-sm px-4 py-1.5 rounded-full border border-zinc-800 hover:border-amber-600/60 hover:text-amber-400 bg-zinc-900/40 transition-colors active:scale-[0.985]"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Philosophers */}
      <div>
        <div className="flex items-end justify-between mb-5 px-0.5">
          <div>
            <div className="uppercase text-xs tracking-[2px] text-amber-400 font-medium">Featured Thinkers</div>
            <h2 className="text-3xl tracking-[-1.1px] font-semibold">Begin a conversation</h2>
          </div>
          <Link 
            href="/chat" 
            className="hidden sm:flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300 font-medium group"
          >
            Open Live Chat <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {(searchTerm ? filteredPhilosophers : featuredPhilosophers).map((philosopher, index) => (
            <PhilosopherCard
              key={index}
              name={philosopher.name}
              era={philosopher.era}
              quote={philosopher.quote}
              slug={philosopher.slug}
            />
          ))}
        </div>

        {searchTerm && filteredPhilosophers.length === 0 && (
          <div className="text-center py-12 text-zinc-500">
            No matches. Try one of the quick searches above or head to <Link href="/encyclopedia" className="underline">the Encyclopedia</Link>.
          </div>
        )}
      </div>

      {/* Value Props / Trust */}
      <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-zinc-800">
        {[
          { icon: BookOpen, title: "Primary Sources First", text: "Every claim is grounded in the actual texts when possible." },
          { icon: null, title: "Llama 70B × Groq", text: "Fast, low-cost inference with strong reasoning for deep dialogue." },
          { icon: null, title: "Persistent & Private", text: "Supabase-ready. Your dialogues can be saved when you connect an account." },
        ].map((item, idx) => (
          <div key={idx} className="flex gap-4 rounded-2xl border border-zinc-800 p-5 bg-zinc-900/40">
            {item.icon && <item.icon className="mt-0.5 h-5 w-5 text-amber-400 flex-shrink-0" />}
            <div>
              <div className="font-medium tracking-tight mb-1">{item.title}</div>
              <p className="text-sm text-zinc-400 leading-snug">{item.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center pt-4">
        <Link 
          href="/chat" 
          className="inline-flex items-center justify-center gap-2 btn btn-primary h-12 rounded-2xl px-8 text-base font-medium"
        >
          Start a conversation now <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhilosopherCardProps {
  name: string;
  era: string;
  quote: string;
  slug: string;
  accent?: string;
  className?: string;
}

const philosopherData: Record<string, { short: string; emoji: string }> = {
  socrates: { short: 'socrates', emoji: '🏛️' },
  nietzsche: { short: 'nietzsche', emoji: '⚡' },
  'marcus-aurelius': { short: 'marcus', emoji: '🛡️' },
  'simone-de-beauvoir': { short: 'beauvoir', emoji: '✍️' },
};

export function PhilosopherCard({ 
  name, 
  era, 
  quote, 
  slug, 
  accent = 'amber', 
  className 
}: PhilosopherCardProps) {
  const data = philosopherData[slug] || { short: slug, emoji: '📜' };

  return (
    <Link 
      href={`/chat?persona=${slug}`}
      className={cn(
        "philosopher-card group card block rounded-2xl p-6 flex flex-col h-full focus-ring",
        className
      )}
    >
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-zinc-900 text-3xl ring-1 ring-inset ring-zinc-800 group-hover:ring-amber-500/30 transition-all">
            {data.emoji}
          </div>
          <div>
            <h3 className="font-semibold text-xl tracking-[-0.4px] text-zinc-100 group-hover:text-amber-400 transition-colors">
              {name}
            </h3>
            <p className="text-sm text-zinc-500">{era}</p>
          </div>
        </div>
        <div className="accent-bar h-9 w-[3px] rounded-full flex-shrink-0 mt-1" />
      </div>

      <blockquote className="flex-1 text-[15px] leading-snug text-zinc-300 border-l-2 border-zinc-800 pl-4 italic">
        “{quote}”
      </blockquote>

      <div className="mt-6 flex items-center justify-between text-sm">
        <span className="text-amber-400/90 group-hover:text-amber-400 font-medium flex items-center gap-1.5 transition-colors">
          Talk with {name.split(' ').pop()}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

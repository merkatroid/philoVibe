import { Scroll } from 'lucide-react';

const texts = [
  { title: 'The Apology', author: 'Plato', period: '4th c. BCE', desc: 'Socrates’ defense at his trial. The origin of the examined life.' },
  { title: 'Meditations', author: 'Marcus Aurelius', period: 'c. 170–180 CE', desc: 'Private notes of a Stoic emperor. Profound reflections on duty and transience.' },
  { title: 'Thus Spoke Zarathustra', author: 'Nietzsche', period: '1883–1885', desc: 'A book for all and none. The birth of the Übermensch and eternal recurrence.' },
  { title: 'The Second Sex', author: 'Simone de Beauvoir', period: '1949', desc: 'Existential analysis of women’s oppression and the path to liberation.' },
  { title: 'Nicomachean Ethics', author: 'Aristotle', period: '4th c. BCE', desc: 'The classic text on eudaimonia and the cultivation of virtue.' },
  { title: 'The Gay Science', author: 'Nietzsche', period: '1882/1887', desc: 'Contains the famous “God is dead” proclamation and joyful wisdom.' },
];

export default function TextsPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <Scroll className="h-7 w-7 text-amber-400" />
        <h1 className="text-4xl font-semibold tracking-[-1.5px]">Primary Texts</h1>
      </div>
      <p className="mb-10 text-xl text-zinc-400 max-w-lg">Curated selections from the canon. Click any to open a reader (placeholder).</p>

      <div className="space-y-3 max-w-3xl">
        {texts.map((text, index) => (
          <div key={index} className="card group flex items-start justify-between gap-8 rounded-2xl p-6 cursor-pointer hover:border-amber-800/40">
            <div>
              <div className="font-semibold text-xl tracking-tight group-hover:text-amber-400 transition-colors">{text.title}</div>
              <div className="text-sm text-amber-400 mt-px">{text.author} • {text.period}</div>
              <p className="mt-4 text-zinc-300 leading-snug pr-4">{text.desc}</p>
            </div>
            <div className="text-xs uppercase tracking-widest text-zinc-500 pt-1 group-hover:text-amber-400/70 transition">READ →</div>
          </div>
        ))}
      </div>

      <p className="text-xs text-zinc-500 mt-8 max-w-md">Full annotated readers + cross-references will load dynamically from Supabase when configured.</p>
    </div>
  );
}

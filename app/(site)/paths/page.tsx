import { GraduationCap, ArrowRight } from 'lucide-react';

const paths = [
  {
    title: 'Foundations of the Good Life',
    length: '6 weeks',
    level: 'Beginner',
    thinkers: 'Socrates, Aristotle, Epicurus',
    desc: 'What does it mean to live well? Explore virtue, pleasure, and eudaimonia through the primary texts.',
  },
  {
    title: 'Stoicism for Turbulent Times',
    length: '4 weeks',
    level: 'All levels',
    thinkers: 'Seneca, Epictetus, Marcus Aurelius',
    desc: 'Practical exercises in acceptance, control, and inner freedom drawn directly from Roman Stoics.',
  },
  {
    title: 'The Death of God & the Revaluation',
    length: '5 weeks',
    level: 'Intermediate',
    thinkers: 'Nietzsche',
    desc: 'A deep dive into nihilism, the Übermensch, and creating values after the collapse of traditional morality.',
  },
  {
    title: 'Existentialism & the Other',
    length: '6 weeks',
    level: 'Intermediate',
    thinkers: 'de Beauvoir, Sartre, Camus',
    desc: 'Freedom, bad faith, gender, and authentic existence. Includes selections from The Second Sex.',
  },
];

export default function LearningPathsPage() {
  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-3">
        <GraduationCap className="h-7 w-7 text-amber-400" />
        <h1 className="text-4xl font-semibold tracking-[-1.5px]">Learning Paths</h1>
      </div>
      <p className="text-xl text-zinc-400">Structured journeys through the greatest ideas. Self-paced. Text + dialogue driven.</p>

      <div className="mt-9 grid gap-5">
        {paths.map((path, i) => (
          <div key={i} className="card rounded-3xl p-8 group">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold text-2xl tracking-tight group-hover:text-amber-400 transition-colors">{path.title}</div>
                <div className="mt-1 flex items-center gap-x-3 text-sm">
                  <span className="text-amber-400">{path.length}</span>
                  <span className="text-zinc-600">•</span>
                  <span>{path.level}</span>
                </div>
              </div>
              <button className="btn btn-secondary h-10 px-6 text-sm hidden sm:inline-flex">
                Begin path <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </button>
            </div>
            
            <p className="mt-5 text-zinc-300 max-w-2xl">{path.desc}</p>
            
            <div className="mt-6 text-sm text-zinc-400">
              Featured thinkers: <span className="text-amber-400/90">{path.thinkers}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-sm border-l-2 border-amber-800 pl-4 text-zinc-400">
        Learning paths will eventually track your progress in Supabase and recommend next conversations in the Live Chat based on what you’ve studied.
      </div>
    </div>
  );
}

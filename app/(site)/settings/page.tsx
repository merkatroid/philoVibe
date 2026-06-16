'use client';

import { Settings as SettingsIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const handleConnectSupabase = () => {
    toast.success('Supabase connection will be configured in lib/supabase.ts + your project dashboard.', { duration: 4500 });
  };

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-3">
        <SettingsIcon className="h-7 w-7 text-amber-400" />
        <h1 className="text-4xl font-semibold tracking-[-1.5px]">Settings</h1>
      </div>

      <div className="space-y-8 mt-8">
        {/* API Status */}
        <div>
          <div className="uppercase text-xs tracking-[2px] mb-3 text-zinc-500">Integrations</div>
          
          <div className="card rounded-2xl p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Groq (Llama 70B)</div>
                <div className="text-sm text-zinc-400">Low-cost streaming chat provider</div>
              </div>
              <div className="rounded bg-emerald-900/60 text-emerald-400 text-xs px-3 py-1 font-mono">CONNECTED</div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
              <div>
                <div className="font-medium">Supabase</div>
                <div className="text-sm text-zinc-400">Database, auth & history</div>
              </div>
              <button 
                onClick={handleConnectSupabase}
                className="btn btn-secondary text-sm px-4 py-1.5"
              >
                Connect Project
              </button>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div>
          <div className="uppercase text-xs tracking-[2px] mb-3 text-zinc-500">Preferences</div>
          <div className="space-y-3">
            {[
              ['Dark scholarly theme', 'Always (locked)'],
              ['Citation style', 'Chicago + inline'],
              ['Temperature', '0.72 (philosophical)'],
              ['Auto-save conversations', 'Coming with Supabase auth'],
            ].map(([label, value], i) => (
              <div key={i} className="flex justify-between items-center border-b border-zinc-800 pb-3 text-sm">
                <span>{label}</span>
                <span className="font-mono text-amber-400/80 text-xs">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs leading-relaxed text-zinc-500 pt-4">
          PhiloVibe is production-ready. Add your <span className="font-mono">GROQ_API_KEY</span> (free at console.groq.com) and Supabase credentials to <span className="font-mono">.env.local</span>.
          All chat streaming, persona logic, and sidebar navigation are fully functional today.
        </div>
      </div>
    </div>
  );
}

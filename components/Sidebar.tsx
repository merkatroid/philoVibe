'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, BookOpen, Scroll, MessageCircle, GraduationCap, Settings, X 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: Home, emoji: '🏠' },
  { href: '/encyclopedia', label: 'Encyclopedia', icon: BookOpen, emoji: '📖' },
  { href: '/texts', label: 'Texts', icon: Scroll, emoji: '📜' },
  { 
    href: '/chat', 
    label: 'Live Chat', 
    icon: MessageCircle, 
    emoji: '💬', 
    highlight: true 
  },
  { href: '/paths', label: 'Learning Paths', icon: GraduationCap, emoji: '🎓' },
  { href: '/settings', label: 'Settings', icon: Settings, emoji: '' },
];

export function Sidebar({ 
  isMobileOpen = false, 
  onClose 
}: { 
  isMobileOpen?: boolean; 
  onClose?: () => void;
}) {
  const pathname = usePathname();

  const asideClasses = cn(
    "sidebar w-72 flex-shrink-0 border-r border-zinc-800 flex flex-col bg-zinc-900",
    // Desktop always visible
    "md:flex md:static md:translate-x-0",
    // Mobile: drawer behavior
    isMobileOpen 
      ? "fixed inset-y-0 left-0 z-[70] translate-x-0" 
      : "hidden md:flex -translate-x-full md:translate-x-0"
  );

  return (
    <aside className={asideClasses}>
      <div className="flex h-16 items-center border-b border-zinc-800 px-6 justify-between">
        <Link href="/" className="flex items-center gap-3 group" onClick={onClose}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-zinc-950 shadow-inner">
            <span className="text-xl font-bold tracking-[-1.5px]">Φ</span>
          </div>
          <div>
            <div className="font-semibold tracking-[-0.5px] text-xl text-zinc-100 group-hover:text-amber-400 transition-colors">
              PhiloVibe
            </div>
            <div className="text-[10px] text-zinc-500 -mt-1">wisdom • dialogue • depth</div>
          </div>
        </Link>

        {/* Mobile close button */}
        {onClose && (
          <button 
            onClick={onClose} 
            className="md:hidden p-2 text-zinc-400 hover:text-zinc-200"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-4 text-sm">
        {navItems.map((item) => {
          const isActive = item.href === '/' 
            ? pathname === '/' 
            : pathname.startsWith(item.href);
          
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'sidebar-link',
                isActive && !item.highlight && 'active',
                item.highlight && 'highlight'
              )}
            >
              <span className="text-base w-5 text-center">{item.emoji}</span>
              <span>{item.label}</span>
              {item.highlight && (
                <span className="ml-auto text-[10px] font-mono tracking-[1px] px-1.5 py-px rounded bg-amber-900/60 text-amber-400">
                  LIVE
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800 mt-auto">
        <div className="px-3 py-2.5 rounded-lg bg-zinc-900/60 text-xs text-zinc-500 leading-snug">
          Powered by <span className="font-mono text-amber-400/90">Llama 70B</span><br />
          via Groq • Supabase ready
        </div>
      </div>
    </aside>
  );
}

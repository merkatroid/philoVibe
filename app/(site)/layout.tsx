'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const closeMobile = () => setIsMobileOpen(false);

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar - always visible */}
      <Sidebar />

      {/* Mobile Top Bar with Hamburger */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-950/95 backdrop-blur px-4 md:hidden">
        <div className="flex items-center gap-2.5 font-semibold tracking-tight">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-[15px] text-zinc-950 font-bold">Φ</div>
          PhiloVibe
        </div>
        
        <button 
          onClick={() => setIsMobileOpen(true)} 
          className="p-2 text-zinc-400 hover:text-zinc-200 transition"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Drawer + Backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobile}
              className="fixed inset-0 bg-black/60 z-[60] md:hidden"
            />
            
            {/* Sidebar Drawer */}
            <Sidebar isMobileOpen={true} onClose={closeMobile} />
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 min-w-0 pt-14 md:pt-0 overflow-x-hidden">
        <div className="mx-auto max-w-5xl px-5 py-8 md:py-10 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}

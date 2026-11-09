'use client';

import { useEffect } from 'react';
import { motion } from 'motion/react';

function Block({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      className={`rounded-lg bg-[#d6d9e0] ${className}`}
      animate={{ opacity: [0.55, 1, 0.55] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

export function IntroSkeleton() {
  // El overlay ya cubre la página: se retira la cubierta CSS previa al pintado
  useEffect(() => {
    delete document.documentElement.dataset.intro;
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-[#eceef2] overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: 'easeInOut' }}
      role="status"
      aria-live="polite"
    >
      {/* Navbar */}
      <div className="h-[70px] px-6 md:px-12 flex items-center">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          <div className="flex flex-col gap-1.5">
            <Block className="w-32 h-4" />
            <Block className="w-16 h-2.5" delay={0.1} />
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Block className="w-16 h-3" delay={0.15} />
            <Block className="w-16 h-3" delay={0.2} />
            <Block className="w-16 h-3" delay={0.25} />
            <Block className="w-24 h-10 ml-2" delay={0.3} />
          </div>
          <Block className="md:hidden w-10 h-10" delay={0.15} />
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-12 items-center pt-16 lg:pt-24">
        <div>
          <Block className="w-36 h-6 rounded-full mb-6" delay={0.1} />
          <div className="space-y-3 mb-6">
            <Block className="w-full max-w-md h-11" delay={0.15} />
            <Block className="w-4/5 max-w-sm h-11" delay={0.2} />
            <Block className="w-3/5 max-w-xs h-11" delay={0.25} />
          </div>
          <div className="space-y-2.5 mb-8">
            <Block className="w-full max-w-md h-3.5" delay={0.3} />
            <Block className="w-3/4 max-w-sm h-3.5" delay={0.35} />
          </div>
          <div className="flex gap-4">
            <Block className="w-40 h-12 rounded-xl" delay={0.4} />
            <Block className="w-32 h-12 rounded-xl" delay={0.45} />
          </div>
        </div>
        <div className="hidden lg:flex justify-center">
          <Block className="w-full max-w-sm h-80 rounded-2xl" delay={0.3} />
        </div>
      </div>

      <p className="absolute bottom-10 inset-x-0 text-center font-mono text-sm text-navy/70">
        Diseñando tu sistema…
      </p>
    </motion.div>
  );
}

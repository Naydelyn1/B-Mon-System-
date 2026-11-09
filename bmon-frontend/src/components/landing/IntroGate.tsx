'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { IntroSkeleton } from '@/components/IntroSkeleton';

const INTRO_KEY = 'montufar_intro_seen';
const INTRO_MS = 2400;

// Se ejecuta antes del primer pintado: marca <html> si toca mostrar la intro
// (primera visita de la sesión y sin prefers-reduced-motion).
export const introScript = `try{if(!sessionStorage.getItem('${INTRO_KEY}')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.dataset.intro='pending'}}catch(e){}`;

const IntroContext = createContext(false);

/** true cuando la intro terminó (o no se mostró) y el hero puede animarse. */
export const useIntroDone = () => useContext(IntroContext);

export function IntroGate({ children }: { children: React.ReactNode }) {
  const [showIntro, setShowIntro] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.intro !== 'pending') {
      setDone(true);
      return;
    }

    setShowIntro(true);
    root.classList.add('scroll-locked');
    window.scrollTo(0, 0);
    try {
      sessionStorage.setItem(INTRO_KEY, '1');
    } catch {
      // sessionStorage bloqueado: la intro se verá de nuevo, sin más efectos
    }

    const timer = setTimeout(() => setShowIntro(false), INTRO_MS);
    return () => {
      clearTimeout(timer);
      root.classList.remove('scroll-locked');
    };
  }, []);

  const finish = useCallback(() => {
    document.documentElement.classList.remove('scroll-locked');
    setDone(true);
  }, []);

  return (
    <IntroContext.Provider value={done}>
      {children}
      <AnimatePresence onExitComplete={finish}>
        {showIntro && <IntroSkeleton key="intro" />}
      </AnimatePresence>
    </IntroContext.Provider>
  );
}

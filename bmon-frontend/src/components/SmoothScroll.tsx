'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      autoRaf: true,
      anchors: true,
      // Mientras la intro bloquea el scroll, Lenis ignora rueda y touch
      virtualScroll: () => !document.documentElement.classList.contains('scroll-locked'),
    });

    return () => lenis.destroy();
  }, []);

  return null;
}

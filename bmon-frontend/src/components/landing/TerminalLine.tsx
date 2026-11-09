'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';

const CHAR_MS = 45;

/** Línea tipo terminal que se escribe sola cuando `start` pasa a true. */
export function TerminalLine({ text, start }: { text: string; start: boolean }) {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(0);

  // El texto completo se pone tras montar (no en el render) para que el HTML
  // del servidor y el primer render del cliente coincidan.
  useEffect(() => {
    if (reduce) {
      setCount(text.length);
      return;
    }
    if (!start || count >= text.length) return;
    const timer = setTimeout(() => setCount((c) => c + 1), CHAR_MS);
    return () => clearTimeout(timer);
  }, [start, reduce, count, text.length]);

  const shown = text.slice(0, count);

  return (
    <p className="font-mono text-sm text-tech mb-5 min-h-[1.25rem]" aria-label={text}>
      <span aria-hidden>
        <span className="text-white/50">&gt; </span>
        {shown}
        <span className="inline-block w-2 h-4 ml-0.5 align-[-2px] bg-tech animate-blink" />
      </span>
    </p>
  );
}

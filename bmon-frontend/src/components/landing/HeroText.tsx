'use client';

import { useEffect, useState } from 'react';
import { motion, type Variants } from 'motion/react';

const ease = [0.22, 1, 0.36, 1] as const;

const LETRAS = 'abcdefghijklmnopqrstuvwxyz<>/{}_=';
const DIGITOS = '0123456789';

/** Variante de cada letra: sube, aparece y pasa de desenfocada a nítida. */
export const letra: Variants = {
  hidden: { opacity: 0, y: '0.45em', filter: 'blur(8px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease } },
};

/** Texto partido en letras animadas. Las palabras no se cortan al saltar de línea. */
export function Letras({ text }: { text: string }) {
  const palabras = text.split(' ');
  return (
    <>
      {palabras.map((p, i) => (
        <span key={i}>
          <span className="inline-block whitespace-nowrap">
            {p.split('').map((c, j) => (
              <motion.span key={j} variants={letra} className="inline-block">
                {c}
              </motion.span>
            ))}
          </span>
          {i < palabras.length - 1 && ' '}
        </span>
      ))}
    </>
  );
}

/**
 * Efecto "descifrar": muestra caracteres aleatorios que se van fijando de izquierda a
 * derecha hasta formar el texto. Con enabled=false devuelve el texto tal cual.
 */
export function useScramble(target: string, enabled: boolean, { delay = 0, duration = 700 } = {}) {
  const [out, setOut] = useState(target);

  useEffect(() => {
    if (!enabled) {
      setOut(target);
      return;
    }
    const glifos = /^[\d\s.,]+$/.test(target) ? DIGITOS : LETRAS;
    let raf = 0;
    let t0 = 0;
    const tick = (now: number) => {
      if (!t0) t0 = now;
      const p = Math.min(1, (now - t0) / duration);
      const fijas = Math.floor(p * target.length);
      let s = '';
      for (let k = 0; k < target.length; k++) {
        const ch = target[k];
        s += k < fijas || ch === ' ' || ch === '+' ? ch : glifos[Math.floor(Math.random() * glifos.length)];
      }
      setOut(s);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    const id = window.setTimeout(() => (raf = requestAnimationFrame(tick)), delay);
    return () => {
      window.clearTimeout(id);
      cancelAnimationFrame(raf);
    };
  }, [target, enabled, delay, duration]);

  return out;
}

/** Texto que se descifra una vez al activarse. */
export function Descifrar({ text, active, delay }: { text: string; active: boolean; delay?: number }) {
  return <>{useScramble(text, active, { delay })}</>;
}

export const PALABRAS = ['impulsan', 'automatizan', 'ordenan', 'hacen crecer'];

/** Palabra destacada que rota cada pocos segundos, con efecto descifrar y subrayado. */
export function PalabraRotativa({ active }: { active: boolean }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!active) {
      setI(0);
      return;
    }
    const id = window.setInterval(() => setI((v) => (v + 1) % PALABRAS.length), 3200);
    return () => window.clearInterval(id);
  }, [active]);

  const texto = useScramble(PALABRAS[i], active, { delay: i === 0 ? 900 : 0, duration: 650 });

  return (
    <motion.span variants={letra} className="relative inline-block whitespace-nowrap text-orange">
      {texto}
      <motion.span
        key={i}
        aria-hidden
        className="absolute left-0 right-0 -bottom-1 h-[3px] rounded-full bg-gradient-to-r from-orange via-orange to-tech origin-left"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: i === 0 ? 1 : 0.15, ease }}
      />
    </motion.span>
  );
}

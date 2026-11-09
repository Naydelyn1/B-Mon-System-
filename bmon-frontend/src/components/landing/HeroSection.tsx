'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from 'motion/react';
import { useIntroDone } from './IntroGate';
import { TerminalLine } from './TerminalLine';
import { HeroLaptop } from './HeroLaptop';
import { Descifrar, Letras, PalabraRotativa } from './HeroText';
import { ArrowRight } from 'lucide-react';

const DESCRIPCION =
  'Desarrollamos sistemas, plataformas SaaS y aplicaciones web a medida. Equipo peruano, calidad internacional.';

const titulo: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.028 } },
};

const parrafo: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.025, delayChildren: 0.2 } },
};

const palabra: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const ease = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

const mockup: Variants = {
  hidden: { opacity: 0, y: 60, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.9, delay: 0.35, ease } },
};

// Datos verificables: los sistemas propios del catálogo y el stack que usamos
const datos = [
  ['3', 'Sistemas propios'],
  ['Next.js + NestJS', 'Stack principal'],
  ['PostgreSQL', 'Base de datos'],
];

export function HeroSection() {
  const introDone = useIntroDone();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90]);
  const state = introDone ? 'show' : 'hidden';
  const animar = introDone && !reduce;

  return (
    <section
      ref={ref}
      id="hero"
      className="min-h-screen bg-night bg-tech-grid bg-grid flex items-center pt-[70px] relative overflow-hidden"
    >
      {/* Glow accents */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-orange/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-tech/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid lg:grid-cols-2 gap-12 items-center py-16 sm:py-20">
        {/* Text */}
        <motion.div variants={container} initial="hidden" animate={state}>
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 px-3 py-1 border border-orange/40 text-orange text-xs font-semibold rounded-full mb-6 tracking-wider uppercase"
          >
            <span className="relative flex w-1.5 h-1.5" aria-hidden>
              <span className="absolute inset-0 rounded-full bg-orange animate-ping opacity-75" />
              <span className="relative w-1.5 h-1.5 rounded-full bg-orange" />
            </span>
            Software a medida
          </motion.span>
          <motion.div variants={item}>
            <TerminalLine text="desplegando tu sistema…" start={introDone} />
          </motion.div>
          {/* Título letra a letra; la palabra naranja rota con efecto "descifrar" */}
          <motion.h1
            variants={titulo}
            className="font-serif text-4xl sm:text-5xl xl:text-6xl text-white leading-[1.12] mb-6"
          >
            <span className="sr-only">Soluciones digitales que impulsan tu negocio</span>
            <span aria-hidden className="block">
              <Letras text="Soluciones digitales" />
            </span>
            <span aria-hidden className="block">
              <Letras text="que" /> <PalabraRotativa active={animar} />
            </span>
            <span aria-hidden className="block">
              <Letras text="tu negocio" />
            </span>
          </motion.h1>
          <motion.p variants={parrafo} className="text-white/70 text-lg leading-relaxed mb-8 max-w-md">
            {DESCRIPCION.split(' ').map((w, i) => (
              <motion.span key={i} variants={palabra} className="inline-block mr-[0.28em]">
                {w}
              </motion.span>
            ))}
          </motion.p>
          <motion.div variants={item} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <a
              href="#contacto"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-ink hover:bg-orange-ink2 text-white font-semibold rounded-xl transition-colors shadow-[0_8px_24px_-10px_rgba(232,98,42,0.7)]"
            >
              Comenzar proyecto
              <ArrowRight size={18} aria-hidden className="transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#sistemas"
              className="px-6 py-3 text-center border border-white/20 text-white/80 hover:text-white hover:border-white/40 rounded-xl transition-colors"
            >
              Ver sistemas
            </a>
          </motion.div>
          <motion.div variants={item} className="flex flex-wrap items-center gap-x-6 xl:gap-x-8 gap-y-4 mt-10 pt-10 border-t border-white/10">
            {datos.map(([valor, label], i) => (
              <div key={label}>
                <p className="font-mono text-white font-semibold text-lg">
                  <Descifrar text={valor} active={animar} delay={1700 + i * 180} />
                </p>
                <p className="text-white/60 text-xs">{label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Laptop escribiendo código: parallax > entrada > flotación */}
        <motion.div style={{ y: parallaxY }} className="hidden md:flex justify-center lg:justify-end" aria-hidden>
          <motion.div variants={mockup} initial="hidden" animate={state} className="w-full max-w-xl px-[7%] lg:px-0">
            <motion.div
              animate={introDone ? { y: [0, -8, 0] } : undefined}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <HeroLaptop start={introDone} />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

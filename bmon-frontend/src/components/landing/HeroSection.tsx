'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from 'motion/react';
import { useIntroDone } from './IntroGate';

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

// Datos ficticios: el mockup no muestra información real de ningún cliente
const demoStats = [
  { label: 'Ingresos', value: 'S/ 8,450', color: 'text-green-400' },
  { label: 'Clientes', value: '24', color: 'text-blue-400' },
  { label: 'Pagos', value: '3 pend.', color: 'text-orange' },
];

const demoClientes = [
  { nombre: 'Cliente Demo 01', estado: 'bg-green-400' },
  { nombre: 'Cliente Demo 02', estado: 'bg-yellow-400' },
  { nombre: 'Cliente Demo 03', estado: 'bg-green-400' },
];

export function HeroSection() {
  const introDone = useIntroDone();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90]);
  const state = introDone ? 'show' : 'hidden';

  return (
    <section
      ref={ref}
      id="hero"
      className="min-h-screen bg-navy flex items-center pt-[70px] relative overflow-hidden"
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}
    >
      {/* Glow accent */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-orange/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid md:grid-cols-2 gap-12 items-center py-20">
        {/* Text */}
        <motion.div variants={container} initial="hidden" animate={state}>
          <motion.span
            variants={item}
            className="inline-block px-3 py-1 bg-orange/20 text-orange text-xs font-semibold rounded-full mb-6 tracking-wider uppercase"
          >
            Software a medida
          </motion.span>
          <motion.h1 variants={item} className="font-serif text-4xl sm:text-5xl md:text-6xl text-white leading-tight mb-6">
            Soluciones digitales que{' '}
            <span className="text-orange">impulsan</span> tu negocio
          </motion.h1>
          <motion.p variants={item} className="text-white/70 text-lg leading-relaxed mb-8 max-w-md">
            Desarrollamos sistemas, plataformas SaaS y aplicaciones web a medida.
            Equipo peruano, calidad internacional.
          </motion.p>
          <motion.div variants={item} className="flex flex-wrap gap-4">
            <a
              href="#contacto"
              className="px-6 py-3 bg-orange hover:bg-orange2 text-white font-semibold rounded-xl transition-colors"
            >
              Comenzar proyecto
            </a>
            <a
              href="#sistemas"
              className="px-6 py-3 border border-white/20 text-white/80 hover:text-white hover:border-white/40 rounded-xl transition-colors"
            >
              Ver sistemas
            </a>
          </motion.div>
          <motion.div variants={item} className="flex flex-wrap items-center gap-x-8 gap-y-4 mt-10 pt-10 border-t border-white/10">
            {datos.map(([valor, label]) => (
              <div key={label}>
                <p className="text-white font-bold text-xl">{valor}</p>
                <p className="text-white/60 text-xs">{label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Mini dashboard card: parallax > entrada > flotación */}
        <motion.div style={{ y: parallaxY }} className="hidden md:flex justify-center" aria-hidden>
          <motion.div variants={mockup} initial="hidden" animate={state} className="w-full max-w-sm">
            <motion.div
              animate={introDone ? { y: [0, -8, 0] } : undefined}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="bg-navy2 rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                <span className="text-white text-sm font-semibold">Montufar Sys Dashboard</span>
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
              </div>
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 p-5">
                {demoStats.map((s) => (
                  <div key={s.label} className="bg-white/5 rounded-xl p-3">
                    <p className={`font-bold text-base ${s.color}`}>{s.value}</p>
                    <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
              {/* Clients list */}
              <div className="px-5 pb-5 space-y-2">
                <p className="text-white/60 text-xs mb-3">Últimos clientes</p>
                {demoClientes.map((c) => (
                  <div key={c.nombre} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                    <span className="text-white/80 text-xs truncate">{c.nombre}</span>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ml-2 ${c.estado}`} />
                  </div>
                ))}
                <p className="text-white/50 text-[10px] text-right pt-1">Datos de demostración</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

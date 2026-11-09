'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { MessageCircle, PenTool, Code2, LifeBuoy } from 'lucide-react';
import { Reveal } from '@/components/Reveal';

const pasos = [
  {
    num: '01',
    icon: MessageCircle,
    title: 'Consultoría inicial',
    desc: 'Entendemos tu negocio, tus procesos y tus objetivos para diseñar la solución perfecta.',
  },
  {
    num: '02',
    icon: PenTool,
    title: 'Diseño y propuesta',
    desc: 'Presentamos wireframes, arquitectura técnica y un presupuesto claro sin sorpresas.',
  },
  {
    num: '03',
    icon: Code2,
    title: 'Desarrollo ágil',
    desc: 'Iteraciones cortas con demos periódicas para que veas el avance en tiempo real.',
  },
  {
    num: '04',
    icon: LifeBuoy,
    title: 'Soporte continuo',
    desc: 'Después del lanzamiento te acompañamos con mantenimiento, mejoras y soporte técnico.',
  },
];

// La línea une los centros de los círculos: con 4 columnas y gap-6 (1.5rem),
// el centro de la primera columna queda en 12.5% - 0.5625rem.
const lineInset = 'calc(12.5% - 0.5625rem)';

function Paso({ paso, index, progress }: { paso: (typeof pasos)[number]; index: number; progress: MotionValue<number> }) {
  const { num, icon: Icon, title, desc } = paso;
  // El círculo se pinta de naranja cuando la línea llega hasta él
  const at = index / (pasos.length - 1);
  const fill = useTransform(progress, [Math.max(0, at - 0.08), at], [0, 1]);

  return (
    <li className="flex md:flex-col md:items-center gap-5 md:gap-6">
      <motion.span
        initial={{ opacity: 0, scale: 0.6 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.4, delay: index * 0.2 }}
        className="relative z-10 w-14 h-14 flex-shrink-0 rounded-full bg-navy border-4 border-mint flex items-center justify-center"
      >
        <motion.span aria-hidden style={{ opacity: fill }} className="absolute inset-0 rounded-full bg-orange" />
        <span className="relative text-white font-bold">{num}</span>
      </motion.span>

      <Reveal delay={0.1 + index * 0.12} className="flex-1 md:w-full h-full">
        <div className="h-full bg-white rounded-2xl p-6 shadow-sm border border-white hover:-translate-y-1 hover:shadow-lg transition duration-200">
          <div className="w-9 h-9 rounded-xl bg-navy flex items-center justify-center mb-4">
            <Icon size={18} className="text-white" />
          </div>
          <h3 className="font-semibold text-navy mb-2">{title}</h3>
          <p className="text-navy/70 text-sm leading-relaxed">{desc}</p>
        </div>
      </Reveal>
    </li>
  );
}

export function ProcesoSection() {
  const reduce = useReducedMotion();
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 80%', 'end 60%'] });
  const progress = useTransform(scrollYProgress, (v) => (reduce ? 1 : v));

  return (
    <section id="proceso" className="py-24 bg-mint">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <Reveal className="text-center mb-16">
          <span className="text-orange2 text-sm font-semibold uppercase tracking-wider">Metodología</span>
          <h2 className="font-serif text-4xl text-navy mt-2">¿Cómo trabajamos?</h2>
          <p className="text-navy/70 mt-4 max-w-xl mx-auto">
            Un proceso claro y transparente de principio a fin.
          </p>
        </Reveal>

        <div className="relative">
          {/* Línea horizontal (escritorio): pista + trazo que se dibuja con el scroll */}
          <div aria-hidden className="hidden md:block absolute top-7 h-0.5 bg-navy/10 rounded-full" style={{ left: lineInset, right: lineInset }} />
          <motion.div
            aria-hidden
            className="hidden md:block absolute top-7 h-0.5 bg-orange rounded-full origin-left"
            style={{ left: lineInset, right: lineInset, scaleX: progress }}
          />
          {/* Línea vertical (móvil) */}
          <div aria-hidden className="md:hidden absolute left-7 top-7 bottom-7 w-0.5 bg-navy/10 rounded-full" />
          <motion.div
            aria-hidden
            className="md:hidden absolute left-7 top-7 bottom-7 w-0.5 bg-orange rounded-full origin-top"
            style={{ scaleY: progress }}
          />

          <ol ref={listRef} className="relative grid md:grid-cols-4 gap-8 md:gap-6">
            {pasos.map((paso, i) => (
              <Paso key={paso.num} paso={paso} index={i} progress={progress} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

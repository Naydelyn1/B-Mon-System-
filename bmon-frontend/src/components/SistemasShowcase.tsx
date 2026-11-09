'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  Bell,
  Boxes,
  CalendarCheck,
  ChartColumn,
  Check,
  CreditCard,
  Dumbbell,
  IdCard,
  MessageCircle,
  PawPrint,
  Puzzle,
  Receipt,
  ShieldCheck,
  ShoppingCart,
  Stethoscope,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Reveal } from '@/components/Reveal';

type SistemaId = 'sysventa' | 'pawsoft' | 'gymflow' | 'medida';

interface Sistema {
  id: SistemaId;
  nombre: string;
  rubro: string;
  icon: LucideIcon;
  resumen: string;
  features: string[];
  cta?: { label: string; href: string };
}

const sistemas: Sistema[] = [
  {
    id: 'sysventa',
    nombre: 'SysVenta',
    rubro: 'Ventas e inventario',
    icon: ShoppingCart,
    resumen: 'Punto de venta con control de stock, listo para emitir comprobantes electrónicos.',
    features: [
      'Facturación electrónica SUNAT (Nubefact)',
      'Consulta de DNI (RENIEC)',
      'Roles: admin, cajero y almacenero',
    ],
  },
  {
    id: 'pawsoft',
    nombre: 'PawSoft',
    rubro: 'Centros veterinarios',
    icon: PawPrint,
    resumen: 'Toda la información de cada paciente y su propietario en un solo lugar.',
    features: ['Propietarios y mascotas', 'Historial clínico', 'Citas y recordatorios'],
  },
  {
    id: 'gymflow',
    nombre: 'GymFlow',
    rubro: 'Gimnasios',
    icon: Dumbbell,
    resumen: 'Membresías, cobros y asistencia de tus socios, en una o varias sedes.',
    features: [
      'Membresías y cobros con avisos',
      'Venta de suplementos',
      'Control de asistencia',
      'Multi-sede',
    ],
  },
  {
    id: 'medida',
    nombre: 'Sistema a tu medida',
    rubro: 'Para cualquier negocio',
    icon: Puzzle,
    resumen: 'Lo diseñamos según tus procesos.',
    features: [
      'Módulos a elección: ventas, clientes, citas, cobros y reportes',
      'Roles y permisos',
      'Integraciones con facturación, WhatsApp o pasarelas de pago',
    ],
    cta: { label: 'Cuéntame tu idea', href: '#contacto' },
  },
];

const ROTATE_MS = 5000;

/* ---------- Mockups (todos con datos ficticios) ---------- */

function SysVentaMock() {
  const items = [
    { nombre: 'Producto Demo A', cant: 2, total: 'S/ 25.00' },
    { nombre: 'Producto Demo B', cant: 1, total: 'S/ 12.50' },
    { nombre: 'Producto Demo C', cant: 3, total: 'S/ 7.50' },
  ];
  return (
    <div className="h-full flex">
      <div className="w-12 bg-navy flex flex-col items-center gap-4 py-4 text-white/70">
        <ShoppingCart size={16} className="text-orange" />
        <Boxes size={16} />
        <Receipt size={16} />
        <Users size={16} />
      </div>
      <div className="flex-1 p-4 sm:p-5 flex flex-col gap-3 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-navy text-sm">Nueva venta</p>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-navy/5 text-navy/70">Rol: cajero</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-cream2 px-3 py-2 text-xs">
          <IdCard size={14} className="text-navy/60 flex-shrink-0" />
          <span className="text-navy/70">DNI 00000000</span>
          <span className="ml-auto flex items-center gap-1 text-green-700 truncate">
            <Check size={12} /> Cliente Demo 01
          </span>
        </div>
        <div className="rounded-lg border border-cream2 divide-y divide-cream2 text-xs">
          {items.map((it) => (
            <div key={it.nombre} className="flex items-center px-3 py-2 gap-2">
              <span className="text-navy/80 truncate">{it.nombre}</span>
              <span className="text-navy/60 ml-auto">x{it.cant}</span>
              <span className="text-navy font-medium w-16 text-right">{it.total}</span>
            </div>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[11px] text-green-700 bg-green-50 px-2 py-1 rounded-md">
            <Receipt size={12} /> Boleta enviada a SUNAT
          </span>
          <span className="text-navy font-bold text-sm">Total S/ 45.00</span>
        </div>
      </div>
    </div>
  );
}

function PawSoftMock() {
  const historial = [
    { fecha: '12/03', evento: 'Vacuna antirrábica' },
    { fecha: '02/02', evento: 'Control general' },
    { fecha: '15/01', evento: 'Desparasitación' },
  ];
  return (
    <div className="h-full p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-5 gap-3">
      <div className="sm:col-span-2 rounded-xl bg-mint p-3 sm:p-4 flex flex-col gap-1 sm:gap-2">
        <div className="hidden sm:flex w-10 h-10 rounded-full bg-white items-center justify-center">
          <PawPrint size={18} className="text-orange" />
        </div>
        <p className="font-semibold text-navy text-sm">Luna (demo)</p>
        <p className="hidden sm:block text-xs text-navy/70">Canino · 4 años</p>
        <p className="text-xs text-navy/70 sm:mt-auto">Propietario: Cliente Demo 02</p>
      </div>
      <div className="sm:col-span-3 flex flex-col gap-3 min-w-0">
        <div className="rounded-xl border border-cream2 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-navy mb-2">
            <Stethoscope size={13} /> Historial clínico
          </p>
          <ul className="space-y-1.5">
            {historial.map((h) => (
              <li key={h.evento} className="flex text-xs gap-3">
                <span className="text-navy/60 w-10">{h.fecha}</span>
                <span className="text-navy/80 truncate">{h.evento}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-navy text-white p-3 flex items-center gap-3">
          <CalendarCheck size={18} className="text-orange flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold">Próxima cita · 10:30</p>
            <p className="text-[11px] text-white/70 flex items-center gap-1">
              <Bell size={11} /> Recordatorio enviado al propietario
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GymFlowMock() {
  const socios = [
    { nombre: 'Socio Demo 01', plan: 'Mensual', estado: 'Activo', color: 'text-green-700 bg-green-50' },
    { nombre: 'Socio Demo 02', plan: 'Trimestral', estado: 'Vence pronto', color: 'text-amber-700 bg-amber-50' },
    { nombre: 'Socio Demo 03', plan: 'Mensual', estado: 'Pago pendiente', color: 'text-orange-ink bg-orange/10' },
  ];
  const asistencia = [0.5, 0.75, 0.6, 0.9, 0.7, 1, 0.4];
  return (
    <div className="h-full p-4 sm:p-5 flex flex-col gap-3">
      <div className="flex gap-2 text-[11px]">
        <span className="px-2.5 py-1 rounded-full bg-navy text-white">Sede Demo Norte</span>
        <span className="px-2.5 py-1 rounded-full bg-navy/5 text-navy/70">Sede Demo Sur</span>
      </div>
      <div className="rounded-xl border border-cream2 divide-y divide-cream2 text-xs">
        {socios.map((s) => (
          <div key={s.nombre} className="flex items-center gap-2 px-3 py-2">
            <span className="text-navy/80 truncate">{s.nombre}</span>
            <span className="text-navy/60 hidden sm:inline">{s.plan}</span>
            <span className={`ml-auto px-2 py-0.5 rounded-full text-[11px] whitespace-nowrap ${s.color}`}>{s.estado}</span>
          </div>
        ))}
      </div>
      <div className="mt-auto grid grid-cols-5 gap-3 items-end">
        <div className="col-span-3 rounded-xl bg-cream p-3">
          <p className="text-[11px] text-navy/70 mb-2">Asistencia semanal</p>
          <div className="flex items-end gap-1.5 h-12">
            {asistencia.map((v, i) => (
              <motion.span
                key={i}
                className="flex-1 h-full rounded-sm bg-orange/80 origin-bottom"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: v }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.05 }}
              />
            ))}
          </div>
        </div>
        <div className="col-span-2 rounded-xl bg-navy text-white p-3">
          <p className="text-[11px] text-white/70">Suplementos</p>
          <p className="text-xs font-semibold mt-1">Venta registrada</p>
        </div>
      </div>
    </div>
  );
}

const modulos: { label: string; icon: LucideIcon; from: { x: number; y: number; rotate: number } }[] = [
  { label: 'Ventas', icon: ShoppingCart, from: { x: -40, y: -30, rotate: -12 } },
  { label: 'Clientes', icon: Users, from: { x: 0, y: -50, rotate: 8 } },
  { label: 'Citas', icon: CalendarCheck, from: { x: 40, y: -30, rotate: 14 } },
  { label: 'Cobros', icon: CreditCard, from: { x: -50, y: 0, rotate: 10 } },
  { label: 'Tu negocio', icon: Puzzle, from: { x: 0, y: 0, rotate: 0 } },
  { label: 'Reportes', icon: ChartColumn, from: { x: 50, y: 0, rotate: -10 } },
  { label: 'Roles', icon: ShieldCheck, from: { x: -40, y: 30, rotate: 12 } },
  { label: 'Facturación', icon: Receipt, from: { x: 0, y: 50, rotate: -8 } },
  { label: 'WhatsApp', icon: MessageCircle, from: { x: 40, y: 30, rotate: -14 } },
];

function MedidaMock() {
  return (
    <div className="h-full p-4 sm:p-5 flex items-center justify-center">
      <div className="grid grid-cols-3 gap-2.5 w-full max-w-[240px]">
        {modulos.map(({ label, icon: Icon, from }, i) => {
          const centro = label === 'Tu negocio';
          return (
            <motion.div
              key={label}
              initial={{ opacity: 0, ...from, scale: 0.85 }}
              animate={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.1 + i * 0.06 }}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1.5 text-center ${
                centro ? 'bg-orange-ink text-white shadow-lg' : 'bg-cream border border-cream2 text-navy'
              }`}
            >
              <Icon size={18} className={centro ? 'text-white' : 'text-navy/70'} />
              <span className="text-[11px] font-medium leading-tight">{label}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

const mocks: Record<SistemaId, () => JSX.Element> = {
  sysventa: SysVentaMock,
  pawsoft: PawSoftMock,
  gymflow: GymFlowMock,
  medida: MedidaMock,
};

/* ---------- Sección ---------- */

export function SistemasShowcase() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  // Sin rotación automática con reduced motion (el usuario elige)
  const autoplay = !reduce && !hovered && !focused;

  useEffect(() => {
    if (!autoplay) return;
    const timer = setTimeout(() => setActive((i) => (i + 1) % sistemas.length), ROTATE_MS);
    return () => clearTimeout(timer);
  }, [active, autoplay]);

  const onKeyDown = useCallback((e: React.KeyboardEvent, i: number) => {
    const delta = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (i + delta + sistemas.length) % sistemas.length;
    setActive(next);
    tabsRef.current[next]?.focus();
  }, []);

  const sistema = sistemas[active];
  const Mock = mocks[sistema.id];

  return (
    <section id="sistemas" className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <Reveal className="text-center mb-14">
          <span className="text-orange-ink text-sm font-semibold uppercase tracking-wider">Catálogo</span>
          <h2 className="font-serif text-4xl text-navy mt-2">Nuestros sistemas</h2>
          <p className="text-navy/70 mt-4 max-w-xl mx-auto">
            Sistemas propios listos para adaptarse a tu negocio, o uno nuevo hecho desde cero para ti.
          </p>
        </Reveal>

        <Reveal>
          <div
            className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-8 items-start"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocus={() => setFocused(true)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
            }}
          >
            {/* Lista */}
            <div role="tablist" aria-label="Sistemas" aria-orientation="vertical" className="grid sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {sistemas.map((s, i) => {
                const selected = i === active;
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    ref={(el) => {
                      tabsRef.current[i] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`tab-${s.id}`}
                    aria-selected={selected}
                    aria-controls="panel-sistema"
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setActive(i)}
                    onKeyDown={(e) => onKeyDown(e, i)}
                    className={`relative overflow-hidden text-left flex items-center gap-4 rounded-2xl px-5 py-4 min-h-[72px] border transition duration-200 ${
                      selected
                        ? 'bg-white border-orange/40 shadow-lg'
                        : 'bg-white/60 border-cream2 hover:bg-white hover:-translate-y-1 hover:shadow-md'
                    }`}
                  >
                    <span
                      className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        selected ? 'bg-orange text-white' : 'bg-navy text-white'
                      }`}
                    >
                      <Icon size={20} />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold text-navy">{s.nombre}</span>
                      <span className="block text-sm text-navy/70">{s.rubro}</span>
                    </span>
                    {/* Progreso hasta el siguiente cambio automático */}
                    {selected && autoplay && (
                      <motion.span
                        key={`${s.id}-progress`}
                        aria-hidden
                        className="absolute left-0 bottom-0 h-0.5 w-full bg-orange origin-left"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: ROTATE_MS / 1000, ease: 'linear' }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mockup + detalle */}
            <div id="panel-sistema" role="tabpanel" aria-labelledby={`tab-${sistema.id}`}>
              <div className="rounded-2xl bg-white shadow-xl border border-cream2 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-cream2 bg-cream/60">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  <span className="ml-3 flex-1 max-w-[240px] truncate rounded-md bg-white border border-cream2 px-3 py-1 text-[11px] text-navy/60">
                    {sistema.nombre} · demo
                  </span>
                </div>
                <div className="h-[300px] sm:h-[320px] relative" aria-hidden>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={sistema.id}
                      className="absolute inset-0"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                    >
                      <Mock />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              <div className="mt-6 min-h-[168px]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={sistema.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="font-serif text-2xl text-navy">{sistema.nombre}</h3>
                    <p className="text-navy/70 mt-1 mb-4">{sistema.resumen}</p>
                    <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                      {sistema.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-navy/80">
                          <Check size={15} className="text-orange mt-0.5 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    {sistema.cta && (
                      <a
                        href={sistema.cta.href}
                        className="mt-5 inline-flex items-center gap-2 min-h-[44px] px-6 bg-orange-ink hover:bg-orange-ink2 text-white text-sm font-semibold rounded-xl transition-colors"
                      >
                        {sistema.cta.label}
                        <ArrowRight size={16} />
                      </a>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

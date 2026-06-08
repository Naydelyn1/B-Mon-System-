import { MessageCircle, PenTool, Code2, LifeBuoy } from 'lucide-react';

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

export function ProcesoSection() {
  return (
    <section id="proceso" className="py-24 bg-mint">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <span className="text-orange text-sm font-semibold uppercase tracking-wider">Metodología</span>
          <h2 className="font-serif text-4xl text-navy mt-2">¿Cómo trabajamos?</h2>
          <p className="text-navy/50 mt-4 max-w-xl mx-auto">
            Un proceso claro y transparente de principio a fin.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {pasos.map(({ num, icon: Icon, title, desc }, i) => (
            <div key={num} className="relative">
              {/* Connector line */}
              {i < pasos.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] right-0 h-px bg-navy/10" />
              )}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-white hover:-translate-y-1 transition-transform duration-200">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-orange/30 font-bold text-2xl leading-none">{num}</span>
                  <div className="w-9 h-9 rounded-xl bg-navy flex items-center justify-center">
                    <Icon size={18} className="text-white" />
                  </div>
                </div>
                <h3 className="font-semibold text-navy mb-2">{title}</h3>
                <p className="text-navy/55 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

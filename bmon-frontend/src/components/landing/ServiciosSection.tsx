import { Globe, Settings, Cloud, MessageSquare, Wrench, Plug } from 'lucide-react';
import { Reveal } from '@/components/Reveal';

const servicios = [
  {
    icon: Globe,
    title: 'Desarrollo Web',
    desc: 'Sitios y aplicaciones web modernas, rápidas y responsivas con las últimas tecnologías.',
  },
  {
    icon: Settings,
    title: 'Sistemas a Medida',
    desc: 'Software personalizado que se adapta exactamente a los procesos de tu empresa.',
  },
  {
    icon: Cloud,
    title: 'SaaS Solutions',
    desc: 'Plataformas en la nube escalables con modelos de suscripción y multi-tenant.',
  },
  {
    icon: MessageSquare,
    title: 'Consultoría IT',
    desc: 'Asesoramiento tecnológico estratégico para tomar las mejores decisiones digitales.',
  },
  {
    icon: Wrench,
    title: 'Mantenimiento',
    desc: 'Soporte continuo, actualizaciones y monitoreo para que tu sistema nunca falle.',
  },
  {
    icon: Plug,
    title: 'Integración de APIs',
    desc: 'Conecta tus sistemas, pasarelas de pago, ERPs y plataformas externas sin fricciones.',
  },
];

export function ServiciosSection() {
  return (
    <section id="servicios" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <Reveal className="text-center mb-16">
          <span className="font-mono text-orange-ink text-sm font-medium">{'// '}Lo que hacemos</span>
          <h2 className="font-serif text-4xl text-navy mt-2">Nuestros Servicios</h2>
          <p className="text-navy/70 mt-4 max-w-xl mx-auto">
            Desde una landing page hasta sistemas empresariales complejos, cubrimos todo el ciclo de desarrollo.
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {servicios.map(({ icon: Icon, title, desc }, i) => (
            <Reveal key={title} delay={(i % 3) * 0.08} className="h-full">
              <div className="group h-full bg-cream rounded-2xl p-7 border border-cream2 hover:shadow-glow hover:-translate-y-1 transition duration-200">
                <div className="w-12 h-12 rounded-xl bg-navy flex items-center justify-center mb-5 group-hover:bg-orange transition-colors duration-200">
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="font-semibold text-navy text-lg mb-3">{title}</h3>
                <p className="text-navy/70 text-sm leading-relaxed">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

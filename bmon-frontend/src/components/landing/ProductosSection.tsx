import { Briefcase, Building2, Check, Rocket } from 'lucide-react';
import { Reveal } from '@/components/Reveal';

const planes = [
  {
    nombre: 'Básico',
    icon: Rocket,
    desc: 'Ideal para pequeñas empresas que están comenzando su transformación digital',
    features: [
      '1 sistema de tu elección',
      'Hasta 3 usuarios con roles',
      'Módulos esenciales del sistema',
      'Dashboard con métricas básicas',
      'Reportes estándar',
      'Soporte por email',
      'Actualizaciones incluidas',
    ],
    destacado: false,
  },
  {
    nombre: 'Profesional',
    icon: Briefcase,
    desc: 'Para empresas en crecimiento que necesitan más control y funcionalidades',
    features: [
      '1 sistema de tu elección',
      'Hasta 10 usuarios con roles',
      'Todos los módulos del sistema',
      'Dashboard avanzado con reportes',
      'Exportación de reportes (Excel / PDF)',
      'Integración con APIs externas',
      'Soporte prioritario',
      'Capacitación al equipo incluida',
    ],
    destacado: true,
  },
  {
    nombre: 'Empresarial',
    icon: Building2,
    desc: 'Solución completa para empresas grandes con procesos y necesidades específicas',
    features: [
      'Sistemas ilimitados o a medida',
      'Usuarios ilimitados',
      'Módulos personalizados',
      'Múltiples sucursales o sedes',
      'Integraciones a medida',
      'Soporte prioritario',
      'Capacitación y acompañamiento continuo',
    ],
    destacado: false,
  },
];

export function ProductosSection() {
  return (
    <section id="planes" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <Reveal className="text-center mb-14">
          <span className="text-orange-ink text-sm font-semibold uppercase tracking-wider">Planes</span>
          <h2 className="font-serif text-4xl text-navy mt-2">Elige tu plan</h2>
          <p className="text-navy/70 mt-4 max-w-md mx-auto text-sm leading-relaxed">
            Sin importar el tamaño de tu empresa, tenemos un plan que se adapta a ti.
            El precio lo conversamos juntos.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {planes.map((plan, i) => (
            <Reveal key={plan.nombre} delay={i * 0.1} className="h-full">
              <div
                className={`h-full rounded-2xl flex flex-col relative overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-xl ${
                  plan.destacado ? 'shadow-xl' : 'shadow-sm'
                }`}
              >
                {plan.destacado && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-navy text-white text-xs font-bold px-4 py-1 rounded-full z-10 tracking-wider uppercase">
                    Recomendado
                  </div>
                )}

                {/* Header */}
                <div className={`p-7 pt-10 rounded-t-2xl ${plan.destacado ? 'bg-orange-ink' : 'bg-navy'}`}>
                  <span className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
                    <plan.icon size={22} className="text-white" />
                  </span>
                  <h3 className="font-bold text-xl text-white mt-3 mb-2">{plan.nombre}</h3>
                  <p className={`text-sm leading-relaxed ${plan.destacado ? 'text-white/90' : 'text-white/70'}`}>
                    {plan.desc}
                  </p>
                </div>

                {/* Features */}
                <div className="bg-white border border-gray-100 rounded-b-2xl flex-1 flex flex-col p-7">
                  <ul className="space-y-3 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <Check size={15} className="text-orange mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-navy/75">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#contacto"
                    className={`mt-7 flex items-center justify-center min-h-[44px] px-5 rounded-xl text-sm font-semibold transition-colors ${
                      plan.destacado
                        ? 'bg-orange-ink hover:bg-orange-ink2 text-white'
                        : 'border-2 border-navy text-navy hover:bg-navy hover:text-white'
                    }`}
                  >
                    Consultar precio
                  </a>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* CTA inferior */}
        <Reveal className="mt-10 bg-navy rounded-2xl px-6 sm:px-8 py-10 text-center">
          <h3 className="font-serif text-2xl text-white mb-2">¿No sabes cuál es el tuyo?</h3>
          <p className="text-white/70 text-sm mb-6 max-w-md mx-auto">
            Cuéntanos cómo funciona tu empresa y te recomendamos el plan ideal — sin compromiso.
          </p>
          <a
            href="#contacto"
            className="inline-block bg-orange-ink hover:bg-orange-ink2 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm"
          >
            Hablar con el equipo
          </a>
        </Reveal>
      </div>
    </section>
  );
}

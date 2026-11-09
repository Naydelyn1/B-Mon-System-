'use client';

import { useState } from 'react';
import { Target, Eye, Lightbulb, Shield, Zap, Heart } from 'lucide-react';
import { Reveal } from '@/components/Reveal';

const tabs = ['Misión', 'Visión'] as const;

const content = {
  Misión: 'Desarrollar soluciones digitales de alta calidad que transformen los procesos de nuestros clientes, combinando tecnología moderna con atención personalizada y precios accesibles para el mercado latinoamericano.',
  Visión: 'Ser el equipo de desarrollo de referencia en Perú y Latinoamérica para empresas que buscan crecer digitalmente, reconocidos por la calidad de nuestro código, la fiabilidad de nuestros sistemas y el impacto real en los negocios de nuestros clientes.',
};

const valores = [
  { icon: Lightbulb, title: 'Innovación', desc: 'Siempre buscamos la mejor solución tecnológica.' },
  { icon: Shield, title: 'Confiabilidad', desc: 'Sistemas robustos y soporte continuo.' },
  { icon: Zap, title: 'Agilidad', desc: 'Entregas rápidas sin sacrificar calidad.' },
  { icon: Heart, title: 'Compromiso', desc: 'Tu éxito es nuestro éxito.' },
];

const equipo = [
  { iniciales: 'NM', nombre: 'Naydelyn Montufar', rol: 'Systems Engineer', bg: 'bg-orange', text: 'text-white' },
];

export function NosotrosSection() {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('Misión');

  return (
    <section id="nosotros" className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <Reveal className="text-center mb-16">
          <span className="text-orange-ink text-sm font-semibold uppercase tracking-wider">Quiénes somos</span>
          <h2 className="font-serif text-4xl text-navy mt-2">El equipo detrás de Montufar Systems</h2>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Tabs Misión / Visión */}
          <Reveal>
            <div className="flex gap-2 mb-6" role="tablist" aria-label="Misión y visión">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-5 min-h-[44px] rounded-xl text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-navy text-white'
                      : 'bg-cream2 text-navy/75 hover:text-navy'
                  }`}
                >
                  {tab === 'Misión' ? <Target size={16} /> : <Eye size={16} />}
                  {tab}
                </button>
              ))}
            </div>
            <div role="tabpanel" className="bg-white rounded-2xl p-8 shadow-sm border border-cream2 min-h-[140px]">
              <p className="text-navy/75 leading-relaxed text-base">{content[activeTab]}</p>
            </div>

            {/* Equipo */}
            <div className="mt-8">
              <p className="text-sm text-navy/70 font-medium mb-4 uppercase tracking-wider">Nuestro equipo</p>
              <div className="flex flex-col gap-3">
                {equipo.map((m) => (
                  <div key={m.nombre} className="flex items-center gap-4 bg-white rounded-xl px-5 py-4 shadow-sm border border-cream2">
                    <div className={`w-10 h-10 rounded-full ${m.bg} flex items-center justify-center ${m.text} text-sm font-bold flex-shrink-0`}>
                      {m.iniciales}
                    </div>
                    <div>
                      <p className="text-navy font-semibold text-sm">{m.nombre}</p>
                      <p className="text-navy/70 text-xs">{m.rol}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Valores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {valores.map(({ icon: Icon, title, desc }, i) => (
              <Reveal key={title} delay={i * 0.08} className="h-full">
                <div className="h-full bg-white rounded-2xl p-6 shadow-sm border border-cream2 hover:-translate-y-1 hover:shadow-lg transition duration-200">
                  <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center mb-4">
                    <Icon size={20} className="text-orange" />
                  </div>
                  <h3 className="font-semibold text-navy mb-2">{title}</h3>
                  <p className="text-navy/70 text-sm leading-relaxed">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

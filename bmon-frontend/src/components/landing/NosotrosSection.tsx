'use client';

import { useState } from 'react';
import { Target, Eye, Lightbulb, Shield, Zap, Heart } from 'lucide-react';

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
  { iniciales: 'JB', nombre: 'Jaime Bravo', rol: 'Systems Engineer', bg: 'bg-navy', text: 'text-white' },
  { iniciales: 'NM', nombre: 'Naydelyn Montufar', rol: 'Systems Engineer', bg: 'bg-orange', text: 'text-white' },
];

export function NosotrosSection() {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('Misión');

  return (
    <section id="nosotros" className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <span className="text-orange text-sm font-semibold uppercase tracking-wider">Quiénes somos</span>
          <h2 className="font-serif text-4xl text-navy mt-2">El equipo detrás de B-Mon</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Tabs Misión / Visión */}
          <div>
            <div className="flex gap-2 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-navy text-white'
                      : 'bg-cream2 text-navy/60 hover:text-navy'
                  }`}
                >
                  {tab === 'Misión' ? <Target size={16} /> : <Eye size={16} />}
                  {tab}
                </button>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-cream2 min-h-[140px]">
              <p className="text-navy/70 leading-relaxed text-base">{content[activeTab]}</p>
            </div>

            {/* Equipo */}
            <div className="mt-8">
              <p className="text-sm text-navy/40 font-medium mb-4 uppercase tracking-wider">Nuestro equipo</p>
              <div className="flex flex-col gap-3">
                {equipo.map((m) => (
                  <div key={m.nombre} className="flex items-center gap-4 bg-white rounded-xl px-5 py-4 shadow-sm border border-cream2">
                    <div className={`w-10 h-10 rounded-full ${m.bg} flex items-center justify-center ${m.text} text-sm font-bold flex-shrink-0`}>
                      {m.iniciales}
                    </div>
                    <div>
                      <p className="text-navy font-semibold text-sm">{m.nombre}</p>
                      <p className="text-navy/50 text-xs">{m.rol}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Valores */}
          <div className="grid grid-cols-2 gap-4">
            {valores.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-6 shadow-sm border border-cream2 hover:-translate-y-1 transition-transform duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-orange" />
                </div>
                <h3 className="font-semibold text-navy mb-2">{title}</h3>
                <p className="text-navy/50 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

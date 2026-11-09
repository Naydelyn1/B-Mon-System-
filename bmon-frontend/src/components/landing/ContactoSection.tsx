'use client';

import { useState } from 'react';
import { Mail, MapPin, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Reveal } from '@/components/Reveal';

export function ContactoSection() {
  const [form, setForm] = useState({ nombre: '', email: '', asunto: '', mensaje: '' });
  const [sending, setSending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.asunto || !form.mensaje) {
      toast.error('Por favor completa todos los campos');
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contacto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success('¡Mensaje enviado! Te responderemos pronto.');
      setForm({ nombre: '', email: '', asunto: '', mensaje: '' });
    } catch {
      toast.error('Error al enviar el mensaje. Inténtalo más tarde.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contacto" className="py-24 bg-navy relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="relative max-w-7xl mx-auto px-6 md:px-12">
        <Reveal className="text-center mb-16">
          <span className="text-orange text-sm font-semibold uppercase tracking-wider">Conversemos</span>
          <h2 className="font-serif text-4xl text-white mt-2">¿Tienes un proyecto en mente?</h2>
          <p className="text-white/70 mt-4 max-w-xl mx-auto">
            Cuéntanos qué necesitas y te respondemos pronto.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Formulario */}
          <Reveal>
            <form onSubmit={handleSubmit} className="bg-navy2 rounded-2xl p-6 sm:p-8 border border-white/10 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="contacto-nombre" className="text-white/70 text-xs font-medium">Nombre</label>
                  <input id="contacto-nombre" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Tu nombre"
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/40 outline-none focus:border-orange transition-colors" />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="contacto-email" className="text-white/70 text-xs font-medium">Email</label>
                  <input id="contacto-email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="tu@email.com"
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/40 outline-none focus:border-orange transition-colors" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="contacto-asunto" className="text-white/70 text-xs font-medium">Asunto</label>
                <input id="contacto-asunto" name="asunto" value={form.asunto} onChange={handleChange} placeholder="¿En qué podemos ayudarte?"
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/40 outline-none focus:border-orange transition-colors" />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="contacto-mensaje" className="text-white/70 text-xs font-medium">Mensaje</label>
                <textarea id="contacto-mensaje" name="mensaje" value={form.mensaje} onChange={handleChange} rows={5}
                  placeholder="Cuéntanos sobre tu proyecto..."
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/40 outline-none focus:border-orange transition-colors resize-none" />
              </div>
              <button type="submit" disabled={sending}
                className="w-full py-3 bg-orange hover:bg-orange2 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                {sending && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {sending ? 'Enviando...' : 'Enviar mensaje'}
              </button>
            </form>
          </Reveal>

          {/* Info */}
          <Reveal delay={0.12} className="flex flex-col justify-center gap-8">
            {[
              { icon: Mail, label: 'Email', value: 'naymontu@gmail.com' },
              { icon: Users, label: 'Equipo', value: 'Naydelyn Montufar' },
              { icon: MapPin, label: 'Ubicación', value: 'Perú — trabajo remoto' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-orange/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={22} className="text-orange" />
                </div>
                <div>
                  <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-white font-medium">{value}</p>
                </div>
              </div>
            ))}
            <div className="mt-4 p-6 rounded-2xl border border-white/10">
              <p className="text-white/60 text-sm leading-relaxed">
                Leemos todos los mensajes y{' '}
                <span className="text-orange font-semibold">te respondemos pronto</span>.
                Si tu proyecto es urgente, indícalo en el asunto.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

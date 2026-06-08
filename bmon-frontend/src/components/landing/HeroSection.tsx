interface StatsPublicos {
  ingresosMes: number;
  clientesActivos: number;
  pagosPendientes: number;
  ultimosClientes: { id: string; nombre: string; estado: string }[];
}

async function fetchStats(): Promise<StatsPublicos | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats-publicos`,
      { next: { revalidate: 120 } },
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function estadoColor(estado: string): string {
  if (estado === 'Activo') return 'bg-green-400';
  if (estado === 'Prueba') return 'bg-yellow-400';
  return 'bg-white/20';
}

export async function HeroSection() {
  const stats = await fetchStats();

  const ingresosFmt = stats
    ? `S/ ${stats.ingresosMes.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    : 'S/ —';
  const clientesFmt = stats ? String(stats.clientesActivos) : '—';
  const pendientesFmt = stats ? `${stats.pagosPendientes} pend.` : '— pend.';

  const ultimosClientes = stats?.ultimosClientes ?? [
    { id: '1', nombre: 'TechPeru SAC', estado: 'Activo' },
    { id: '2', nombre: 'Inversiones JM', estado: 'Prueba' },
    { id: '3', nombre: 'Digital Corp', estado: 'Activo' },
  ];

  return (
    <section
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
        <div>
          <span className="inline-block px-3 py-1 bg-orange/20 text-orange text-xs font-semibold rounded-full mb-6 tracking-wider uppercase">
            Software a medida
          </span>
          <h1 className="font-serif text-5xl md:text-6xl text-white leading-tight mb-6">
            Soluciones digitales que{' '}
            <span className="text-orange">impulsan</span> tu negocio
          </h1>
          <p className="text-white/60 text-lg leading-relaxed mb-8 max-w-md">
            Desarrollamos sistemas, plataformas SaaS y aplicaciones web a medida.
            Equipo peruano, calidad internacional.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="#contacto"
              className="px-6 py-3 bg-orange hover:bg-orange2 text-white font-semibold rounded-xl transition-colors"
            >
              Comenzar proyecto
            </a>
            <a
              href="#servicios"
              className="px-6 py-3 border border-white/20 text-white/80 hover:text-white hover:border-white/40 rounded-xl transition-colors"
            >
              Ver servicios
            </a>
          </div>
          <div className="flex items-center gap-6 mt-10 pt-10 border-t border-white/10">
            {[['10+', 'Proyectos'], ['2', 'Años de exp.'], ['100%', 'Satisfacción']].map(([num, label]) => (
              <div key={label}>
                <p className="text-white font-bold text-xl">{num}</p>
                <p className="text-white/40 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mini dashboard card */}
        <div className="hidden md:flex justify-center">
          <div className="animate-float w-full max-w-sm bg-navy2 rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <span className="text-white text-sm font-semibold">B-Mon Dashboard</span>
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
            </div>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 p-5">
              {[
                { label: 'Ingresos', value: ingresosFmt, color: 'text-green-400' },
                { label: 'Clientes', value: clientesFmt, color: 'text-blue-400' },
                { label: 'Pagos', value: pendientesFmt, color: 'text-orange' },
              ].map((s) => (
                <div key={s.label} className="bg-white/5 rounded-xl p-3">
                  <p className={`font-bold text-base ${s.color}`}>{s.value}</p>
                  <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            {/* Clients list */}
            <div className="px-5 pb-5 space-y-2">
              <p className="text-white/40 text-xs mb-3">Últimos clientes</p>
              {ultimosClientes.map((c) => (
                <div key={c.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                  <span className="text-white/70 text-xs truncate">{c.nombre}</span>
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ml-2 ${estadoColor(c.estado)}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const links = {
  Servicios: [
    { label: 'Desarrollo Web', href: '#servicios' },
    { label: 'Sistemas a Medida', href: '#sistemas' },
    { label: 'SaaS Solutions', href: '#servicios' },
    { label: 'Consultoría IT', href: '#servicios' },
  ],
  Empresa: [
    { label: 'Nosotros', href: '#nosotros' },
    { label: 'Metodología', href: '#proceso' },
    { label: 'Tecnologías', href: '#tecnologias' },
    { label: 'Contacto', href: '#contacto' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[#111827] text-white/70 py-16">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <p className="text-white font-bold text-lg leading-tight">Montufar Sys</p>
              <p className="text-orange text-xs">Systems</p>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Desarrollamos soluciones digitales a medida para empresas que quieren crecer.
              Equipo peruano, alcance global.
            </p>
            <p className="text-xs mt-6">naymontu@gmail.com</p>
          </div>

          {/* Links */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <p className="text-white text-sm font-semibold mb-4">{title}</p>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="inline-flex items-center min-h-[32px] text-sm hover:text-white transition-colors">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs">© {new Date().getFullYear()} Montufar Systems. Todos los derechos reservados.</p>
          <p className="text-xs">Hecho con ♥ en Perú</p>
        </div>
      </div>
    </footer>
  );
}

const links = {
  Servicios: ['Desarrollo Web', 'Sistemas a Medida', 'SaaS Solutions', 'Consultoría IT'],
  Empresa: ['Nosotros', 'Proceso', 'Tecnologías', 'Contacto'],
};

export function Footer() {
  return (
    <footer className="bg-[#111827] text-white/50 py-16">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <p className="text-white font-bold text-lg leading-tight">B-Mon System</p>
              <p className="text-orange text-xs">Development</p>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Desarrollamos soluciones digitales a medida para empresas que quieren crecer.
              Equipo peruano, alcance global.
            </p>
            <p className="text-xs mt-6">b-mondev@gmail.com</p>
          </div>

          {/* Links */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <p className="text-white text-sm font-semibold mb-4">{title}</p>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs">© {new Date().getFullYear()} B-Mon System Development. Todos los derechos reservados.</p>
          <p className="text-xs">Hecho con ♥ en Perú</p>
        </div>
      </div>
    </footer>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const links = [
  { label: 'Home', href: '#hero' },
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Servicios', href: '#servicios' },
  { label: 'Productos', href: '#productos' },
  { label: 'Clientes', href: '#clientes' },
  { label: 'Contacto', href: '#contacto' },
];

export function Navbar() {
  const [activeSection, setActiveSection] = useState('hero');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    links.forEach(({ href }) => {
      const id = href.replace('#', '');
      const el = document.getElementById(id);
      if (!el) return;

      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.4 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy h-[70px] flex items-center px-6 md:px-12">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex flex-col leading-tight">
          <span className="text-white font-bold text-lg tracking-wide">B-Mon System</span>
          <span className="text-orange text-xs font-medium">Development</span>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map(({ label, href }) => {
            const id = href.replace('#', '');
            return (
              <a
                key={href}
                href={href}
                className={`text-sm transition-colors ${
                  activeSection === id
                    ? 'text-orange font-semibold'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {label}
              </a>
            );
          })}
          <a
            href="#contacto"
            className="ml-2 px-4 py-2 bg-orange hover:bg-orange2 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Contacto
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-[70px] left-0 right-0 bg-navy2 flex flex-col md:hidden shadow-lg">
          {links.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="px-6 py-3 text-white/80 hover:text-white hover:bg-white/5 text-sm border-b border-white/10"
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

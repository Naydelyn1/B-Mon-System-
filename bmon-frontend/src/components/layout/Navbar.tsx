'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, X } from 'lucide-react';

const links = [
  { label: 'Inicio', id: 'hero' },
  { label: 'Nosotros', id: 'nosotros' },
  { label: 'Servicios', id: 'servicios' },
  { label: 'Sistemas', id: 'sistemas' },
  { label: 'Planes', id: 'planes' },
  { label: 'Metodología', id: 'proceso' },
];

const observedIds = [...links.map((l) => l.id), 'contacto'];

export function Navbar() {
  const [activeSection, setActiveSection] = useState('hero');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Sección activa: la que cruza la franja central del viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -54% 0px' },
    );
    observedIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav aria-label="Principal" className="fixed top-0 left-0 right-0 z-50 h-[70px] pointer-events-none">
      {/* Fondo: sólido arriba; al bajar, compacto (70 → 60 px con scaleY) y con blur */}
      <div
        aria-hidden
        className={`absolute inset-0 bg-night transition-opacity duration-300 ${scrolled ? 'opacity-0' : 'opacity-100'}`}
      />
      <div
        aria-hidden
        className={`absolute inset-0 origin-top bg-night/80 backdrop-blur-md border-b border-tech/15 shadow-lg shadow-black/10 transition duration-300 ${
          scrolled ? 'opacity-100 scale-y-[0.857]' : 'opacity-0'
        }`}
      />

      <div
        className={`relative h-full flex items-center px-6 md:px-12 pointer-events-auto transition-transform duration-300 ${
          scrolled ? '-translate-y-[5px]' : ''
        }`}
      >
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          {/* Logo */}
          <a
            href="#hero"
            className={`flex flex-col leading-tight origin-left transition-transform duration-300 ${scrolled ? 'scale-95' : ''}`}
          >
            <span className="text-white font-bold text-lg tracking-wide">Montufar Sys</span>
            <span className="text-orange text-xs font-medium">Systems</span>
          </a>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-6">
            {links.map(({ label, id }) => {
              const active = activeSection === id;
              return (
                <a
                  key={id}
                  href={`#${id}`}
                  aria-current={active ? 'true' : undefined}
                  className={`relative inline-flex items-center min-h-[44px] text-sm transition-colors ${
                    active ? 'text-orange font-semibold' : 'text-white/75 hover:text-white'
                  }`}
                >
                  {label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute left-0 right-0 bottom-2 h-0.5 rounded-full bg-orange"
                    />
                  )}
                </a>
              );
            })}
            <a
              href="#contacto"
              aria-current={activeSection === 'contacto' ? 'true' : undefined}
              className={`ml-2 inline-flex items-center min-h-[44px] px-5 bg-orange-ink hover:bg-orange-ink2 text-white text-sm font-semibold rounded-lg transition-colors ${
                activeSection === 'contacto' ? 'ring-2 ring-white/70 ring-offset-2 ring-offset-night' : ''
              }`}
            >
              Contacto
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="lg:hidden w-11 h-11 -mr-2 flex items-center justify-center text-white rounded-lg"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            aria-controls="menu-movil"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`absolute inset-x-0 top-0 pointer-events-auto transition-transform duration-300 ${
          scrolled ? '-translate-y-[10px]' : ''
        }`}
      >
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              id="menu-movil"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="absolute top-[70px] left-0 right-0 bg-night2 flex flex-col lg:hidden shadow-lg"
            >
              {[...links, { label: 'Contacto', id: 'contacto' }].map(({ label, id }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={() => setMenuOpen(false)}
                  aria-current={activeSection === id ? 'true' : undefined}
                  className={`px-6 min-h-[48px] flex items-center text-sm border-b border-white/10 hover:bg-white/5 ${
                    activeSection === id ? 'text-orange font-semibold' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {label}
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

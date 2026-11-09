import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import gymflowDashboard from '@/assets/sistemas/gymflow-dashboard.jpg';
import pharmacoreProductos from '@/assets/sistemas/pharmacore-productos.jpg';

/** Captura en un marco de navegador. */
function Ventana({ src, label, className = '' }: { src: typeof gymflowDashboard; label: string; className?: string }) {
  return (
    <div className={`rounded-xl overflow-hidden border border-white/15 bg-night2 ${className}`}>
      <div className="flex items-center gap-1.5 px-3 h-7 border-b border-white/10" aria-hidden>
        <span className="w-2 h-2 rounded-full bg-white/20" />
        <span className="w-2 h-2 rounded-full bg-white/20" />
        <span className="w-2 h-2 rounded-full bg-white/20" />
        <span className="ml-2 font-mono text-[10px] text-white/40">{label}</span>
      </div>
      <Image src={src} alt="" sizes="(min-width: 1024px) 42vw, 1px" placeholder="blur" className="w-full h-auto" />
    </div>
  );
}

/** Mitad visual (solo en pantallas grandes): marca y capturas reales de los sistemas. */
function PanelVisual() {
  return (
    <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-night bg-tech-grid bg-grid text-white p-10 xl:p-14">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-tech/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 -right-32 w-[520px] h-[520px] rounded-full bg-orange/10 blur-3xl"
      />

      <Link href="/" className="relative self-start rounded-lg" aria-label="Montufar Sys, ir al inicio">
        <span className="block font-serif text-2xl">Montufar Sys</span>
        <span className="block text-tech text-sm font-medium">Systems</span>
      </Link>

      <div className="relative">
        <p className="font-mono text-xs text-tech mb-3">{'// panel interno'}</p>
        <h2 className="font-serif text-3xl xl:text-4xl leading-tight max-w-md">
          Tus clientes, contratos y pagos en un solo lugar.
        </h2>
        <p className="mt-3 text-white/60 text-sm max-w-sm">
          Gestiona los sistemas que desarrollamos y sigue cada suscripción desde aquí.
        </p>

        <div className="relative mt-16 mr-8" aria-hidden>
          <Ventana
            src={pharmacoreProductos}
            label="pharmacore"
            className="absolute -top-8 left-12 right-[-3rem] rotate-2 opacity-50"
          />
          <Ventana src={gymflowDashboard} label="gymflow" className="relative shadow-glow" />
        </div>
      </div>

      <p className="relative font-mono text-xs text-white/40">© {new Date().getFullYear()} Montufar Systems</p>
    </aside>
  );
}

/** Marco común de login, recuperar y restablecer contraseña: imagen a la izquierda, formulario a la derecha. */
export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-cream">
      <PanelVisual />

      <main
        className="flex items-center justify-center p-4 sm:p-8"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(26,32,53,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        <div className="w-full max-w-sm">
          {/* En móvil no hay panel visual: el logo va arriba del formulario */}
          <Link href="/" className="lg:hidden block text-center mb-8 rounded-lg" aria-label="Montufar Sys, ir al inicio">
            <span className="block font-serif text-3xl text-navy">Montufar Sys</span>
            <span className="block text-orange-ink text-sm font-medium mt-1">Systems</span>
          </Link>

          <div className="bg-white rounded-2xl shadow-lg border border-cream2 p-6 sm:p-8">
            <h1 className="text-navy font-semibold text-xl mb-1">{title}</h1>
            {subtitle && <p className="text-navy/60 text-sm mb-7">{subtitle}</p>}
            {children}
          </div>

          {footer && <div className="mt-6 text-center text-sm text-navy/70">{footer}</div>}
        </div>
      </main>
    </div>
  );
}

export const inputClass = (hasError: boolean) =>
  `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors bg-white text-navy placeholder:text-gray-400 ${
    hasError ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-orange'
  }`;

export function SubmitButton({ loading, children, loadingText }: { loading: boolean; children: ReactNode; loadingText: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3 bg-orange-ink hover:bg-orange-ink2 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
    >
      {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden />}
      {loading ? loadingText : children}
    </button>
  );
}

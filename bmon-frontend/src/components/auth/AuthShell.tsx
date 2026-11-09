import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { loginImagen } from './login-imagen';

/** Mitad visual (solo en pantallas grandes): tu imagen a pantalla completa, o el fondo tech si no hay. */
function PanelVisual() {
  return (
    <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-night bg-tech-grid bg-grid text-white p-10 xl:p-14">
      {loginImagen ? (
        <>
          <Image
            src={loginImagen}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 1px"
            placeholder="blur"
            className="object-cover"
          />
          {/* Oscurece arriba y abajo para que el logo y el texto se lean sobre cualquier foto */}
          <div aria-hidden className="absolute inset-0 bg-night/30" />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-night from-5% via-night/75 via-45% to-transparent"
          />
          <div aria-hidden className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-night/70 to-transparent" />
        </>
      ) : (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-tech/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-48 -right-32 w-[520px] h-[520px] rounded-full bg-orange/10 blur-3xl"
          />
        </>
      )}

      <Link href="/" className="relative self-start rounded-lg" aria-label="Montufar Sys, ir al inicio">
        <span className="block font-serif text-2xl">Montufar Sys</span>
        <span className="block text-tech text-sm font-medium">Systems</span>
      </Link>

      <div className="relative">
        <p className="font-mono text-xs text-tech mb-3">{'// panel interno'}</p>
        <h2 className="font-serif text-3xl xl:text-4xl leading-tight max-w-md">
          Tus clientes, contratos y pagos en un solo lugar.
        </h2>
        <p className="mt-3 text-white/70 text-sm max-w-sm">
          Gestiona los sistemas que desarrollamos y sigue cada suscripción desde aquí.
        </p>
        <p className="mt-10 font-mono text-xs text-white/50">© {new Date().getFullYear()} Montufar Systems</p>
      </div>
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

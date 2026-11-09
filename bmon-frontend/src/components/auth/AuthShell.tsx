import Link from 'next/link';
import type { ReactNode } from 'react';

/** Marco común de login, recuperar y restablecer contraseña. */
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
    <div
      className="min-h-screen bg-cream flex items-center justify-center p-4"
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(26,32,53,0.06) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-center mb-8 rounded-lg" aria-label="Montufar Sys, ir al inicio">
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

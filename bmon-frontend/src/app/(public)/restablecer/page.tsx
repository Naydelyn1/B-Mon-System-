'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CheckCircle2, Link2Off } from 'lucide-react';
import api, { apiErrorMessage } from '@/lib/axios';
import AuthShell, { SubmitButton } from '@/components/auth/AuthShell';
import PasswordInput from '@/components/auth/PasswordInput';

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .max(72, 'Máximo 72 caracteres')
      .regex(/[A-Za-z]/, 'Incluye al menos una letra')
      .regex(/\d/, 'Incluye al menos un número'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: 'Las contraseñas no coinciden', path: ['confirm'] });

type FormData = z.infer<typeof schema>;

type Estado = 'cargando' | 'form' | 'sin-token' | 'invalido' | 'listo';

const volver = (
  <Link href="/login" className="inline-flex items-center gap-1.5 py-2 font-medium text-navy hover:text-orange-ink">
    <ArrowLeft size={16} aria-hidden /> Volver a iniciar sesión
  </Link>
);

export default function RestablecerPage() {
  const [token, setToken] = useState<string | null>(null);
  const [estado, setEstado] = useState<Estado>('cargando');
  const [errorMsg, setErrorMsg] = useState('');

  // El token llega en el fragmento (#token=...). Se lee y se quita de la barra de direcciones.
  useEffect(() => {
    const t = new URLSearchParams(window.location.hash.slice(1)).get('token');
    if (t) {
      setToken(t);
      setEstado('form');
      window.history.replaceState(null, '', window.location.pathname);
    } else {
      // Si ya se leyó (el efecto puede correr dos veces), no lo marca como ausente
      setEstado((prev) => (prev === 'cargando' ? 'sin-token' : prev));
    }
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ password }: FormData) => {
    try {
      await api.post('/auth/reset-password', { token, password });
      setEstado('listo');
    } catch (err) {
      setErrorMsg(apiErrorMessage(err, 'El enlace no es válido o ya expiró. Solicita uno nuevo.'));
      setEstado('invalido');
    }
  };

  if (estado === 'cargando') return <AuthShell title="Restablecer contraseña"><div className="h-40" /></AuthShell>;

  if (estado === 'listo') {
    return (
      <AuthShell title="Contraseña actualizada">
        <div role="status" className="flex flex-col items-center text-center gap-4">
          <span className="w-14 h-14 rounded-full bg-green-50 text-green-700 flex items-center justify-center">
            <CheckCircle2 size={28} aria-hidden />
          </span>
          <p className="text-sm text-navy/80">Ya puedes iniciar sesión con tu contraseña nueva.</p>
          <Link
            href="/login"
            className="w-full py-3 bg-orange-ink hover:bg-orange-ink2 text-white font-semibold rounded-xl transition-colors text-center"
          >
            Iniciar sesión
          </Link>
        </div>
      </AuthShell>
    );
  }

  if (estado === 'sin-token' || estado === 'invalido') {
    return (
      <AuthShell title="Enlace no válido" footer={volver}>
        <div role="alert" className="flex flex-col items-center text-center gap-4">
          <span className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
            <Link2Off size={28} aria-hidden />
          </span>
          <p className="text-sm text-navy/80">
            {estado === 'invalido'
              ? errorMsg
              : 'Abre el enlace completo que te enviamos por correo, o solicita uno nuevo.'}
          </p>
          <Link
            href="/recuperar"
            className="w-full py-3 bg-orange-ink hover:bg-orange-ink2 text-white font-semibold rounded-xl transition-colors text-center"
          >
            Solicitar otro enlace
          </Link>
        </div>
      </AuthShell>
    );
  }

  const pass = watch('password') ?? '';
  const reglas = [
    { ok: pass.length >= 8, texto: 'Mínimo 8 caracteres' },
    { ok: /[A-Za-z]/.test(pass), texto: 'Al menos una letra' },
    { ok: /\d/.test(pass), texto: 'Al menos un número' },
  ];

  return (
    <AuthShell title="Crea una contraseña nueva" subtitle="Elige una que no uses en otros sitios." footer={volver}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium text-navy">Contraseña nueva</label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            autoFocus
            hasError={!!errors.password}
            aria-invalid={!!errors.password}
            aria-describedby="password-reglas"
            {...register('password')}
          />
          <ul id="password-reglas" className="mt-1.5 space-y-1">
            {reglas.map((r) => (
              <li key={r.texto} className={`flex items-center gap-2 text-xs ${r.ok ? 'text-green-700' : 'text-navy/60'}`}>
                <span
                  aria-hidden
                  className={`w-1.5 h-1.5 rounded-full ${r.ok ? 'bg-green-600' : 'bg-navy/30'}`}
                />
                {r.texto}
                <span className="sr-only">{r.ok ? '(cumplido)' : '(pendiente)'}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="confirm" className="text-sm font-medium text-navy">Repite la contraseña</label>
          <PasswordInput
            id="confirm"
            autoComplete="new-password"
            hasError={!!errors.confirm}
            aria-invalid={!!errors.confirm}
            aria-describedby={errors.confirm ? 'confirm-error' : undefined}
            {...register('confirm')}
          />
          {errors.confirm && <p id="confirm-error" className="text-xs text-red-600">{errors.confirm.message}</p>}
        </div>

        <SubmitButton loading={isSubmitting} loadingText="Guardando...">Guardar contraseña</SubmitButton>
      </form>
    </AuthShell>
  );
}

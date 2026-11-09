'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, MailCheck } from 'lucide-react';
import api, { apiErrorMessage } from '@/lib/axios';
import AuthShell, { inputClass, SubmitButton } from '@/components/auth/AuthShell';

const schema = z.object({ email: z.string().email('Email inválido') });
type FormData = z.infer<typeof schema>;

const volver = (
  <Link href="/login" className="inline-flex items-center gap-1.5 py-2 font-medium text-navy hover:text-orange-ink">
    <ArrowLeft size={16} aria-hidden /> Volver a iniciar sesión
  </Link>
);

export default function RecuperarPage() {
  const [enviadoA, setEnviadoA] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }: FormData) => {
    try {
      await api.post('/auth/forgot-password', { email });
      setEnviadoA(email);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'No pudimos procesar la solicitud. Inténtalo de nuevo.'));
    }
  };

  if (enviadoA) {
    return (
      <AuthShell title="Revisa tu correo" footer={volver}>
        <div role="status" className="flex flex-col items-center text-center gap-4">
          <span className="w-14 h-14 rounded-full bg-orange/10 text-orange-ink flex items-center justify-center">
            <MailCheck size={28} aria-hidden />
          </span>
          <p className="text-sm text-navy/80 leading-relaxed">
            Si <strong className="text-navy break-all">{enviadoA}</strong> está registrado, te enviamos un enlace para
            crear una contraseña nueva. Vale <strong>30 minutos</strong>.
          </p>
          <p className="text-xs text-navy/60">¿No llegó? Revisa la carpeta de spam o vuelve a intentarlo en un minuto.</p>
          <button
            type="button"
            onClick={() => setEnviadoA(null)}
            className="text-sm font-medium text-orange-ink hover:text-orange-ink2 hover:underline underline-offset-2 py-2"
          >
            Usar otro correo
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="¿Olvidaste tu contraseña?"
      subtitle="Escribe el email de tu cuenta y te enviaremos un enlace para crear una nueva."
      footer={volver}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium text-navy">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            placeholder="tu@email.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
            className={inputClass(!!errors.email)}
          />
          {errors.email && <p id="email-error" className="text-xs text-red-600">{errors.email.message}</p>}
        </div>
        <SubmitButton loading={isSubmitting} loadingText="Enviando...">Enviar enlace</SubmitButton>
      </form>
    </AuthShell>
  );
}

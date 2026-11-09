'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';
import { apiErrorMessage } from '@/lib/axios';
import AuthShell, { inputClass, SubmitButton } from '@/components/auth/AuthShell';
import PasswordInput from '@/components/auth/PasswordInput';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
    } catch (err: unknown) {
      toast.error(apiErrorMessage(err, 'Credenciales incorrectas'));
    }
  };

  return (
    <AuthShell title="Acceder al panel" subtitle="Solo para el equipo Montufar Sys">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium text-navy">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
            className={inputClass(!!errors.email)}
          />
          {errors.email && <p id="email-error" className="text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="password" className="text-sm font-medium text-navy">Contraseña</label>
            <Link
              href="/recuperar"
              className="text-sm font-medium text-orange-ink hover:text-orange-ink2 hover:underline underline-offset-2 py-2 -my-2"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            hasError={!!errors.password}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
          {errors.password && <p id="password-error" className="text-xs text-red-600">{errors.password.message}</p>}
        </div>

        <SubmitButton loading={isSubmitting} loadingText="Ingresando...">Ingresar</SubmitButton>
      </form>
    </AuthShell>
  );
}

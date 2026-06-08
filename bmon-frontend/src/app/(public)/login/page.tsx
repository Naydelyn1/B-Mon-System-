'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [showPass, setShowPass] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Credenciales incorrectas';
      toast.error(msg);
    }
  };

  return (
    <div
      className="min-h-screen bg-cream flex items-center justify-center p-4"
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(26,32,53,0.06) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-navy">B-Mon System</h1>
          <p className="text-orange text-sm font-medium mt-1">Development</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-cream2 p-8">
          <h2 className="text-navy font-semibold text-xl mb-1">Acceder al panel</h2>
          <p className="text-navy/40 text-sm mb-7">Solo para el equipo B-Mon</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-navy">Email</label>
              <input
                type="email"
                placeholder="tu@email.com"
                {...register('email')}
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors bg-white text-navy placeholder:text-gray-300
                  ${errors.email ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-orange'}`}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-navy">Contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className={`w-full px-4 py-3 pr-11 rounded-xl border text-sm outline-none transition-colors bg-white text-navy placeholder:text-gray-300
                    ${errors.password ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-orange'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-orange hover:bg-orange2 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

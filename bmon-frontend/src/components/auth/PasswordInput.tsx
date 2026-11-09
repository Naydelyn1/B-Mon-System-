'use client';

import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { inputClass } from './AuthShell';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { hasError?: boolean };

/** Campo de contraseña con botón para mostrarla u ocultarla. */
const PasswordInput = forwardRef<HTMLInputElement, Props>(function PasswordInput({ hasError = false, ...props }, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input ref={ref} type={visible ? 'text' : 'password'} {...props} className={`${inputClass(hasError)} pr-12`} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        aria-pressed={visible}
        className="absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-xl text-gray-500 hover:text-navy transition-colors"
      >
        {visible ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
      </button>
    </div>
  );
});

export default PasswordInput;

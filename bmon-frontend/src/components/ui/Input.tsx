import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-navy">{label}</label>
      )}
      <input
        ref={ref}
        className={`
          w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors
          bg-white text-navy placeholder:text-gray-400
          ${error ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-orange'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);

Input.displayName = 'Input';

'use client';

import { useAuth } from '@/providers/AuthProvider';

interface TopbarProps {
  title: string;
}

export function Topbar({ title }: TopbarProps) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-lg font-semibold text-navy">{title}</h1>
      {user && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Hola, <span className="text-navy font-medium">{user.nombre}</span></span>
          <div className="w-8 h-8 rounded-full bg-orange flex items-center justify-center text-white text-xs font-bold">
            {user.nombre?.slice(0, 2).toUpperCase() ?? '??'}
          </div>
        </div>
      )}
    </header>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Users, CreditCard, FileText } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Productos', href: '/productos', icon: Package },
  { label: 'Clientes', href: '/clientes', icon: Users },
  { label: 'Contratos', href: '/contratos', icon: FileText },
  { label: 'Pagos', href: '/pagos', icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-[220px] min-h-screen bg-navy flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <p className="text-white font-bold text-base leading-tight">B-Mon System</p>
        <p className="text-orange text-xs">Development</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-3">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                ${active
                  ? 'bg-white/10 text-white border-l-2 border-orange pl-[10px]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-white/10">
        {user && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-orange flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user.nombre?.slice(0, 2).toUpperCase() ?? '??'}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-medium truncate">{user.nombre}</p>
              <p className="text-white/50 text-xs capitalize">{user.rol}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full text-left text-xs text-white/40 hover:text-white/70 transition-colors py-1"
        >
          Cerrar sesión →
        </button>
      </div>
    </aside>
  );
}

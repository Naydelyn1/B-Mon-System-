'use client';

import { useQuery } from '@tanstack/react-query';
import { DollarSign, Users, Package, Clock, FileText, RefreshCw, AlertTriangle } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/axios';

interface DashboardResumen {
  ingresosMes: number;
  clientesActivos: number;
  productosActivos: number;
  pagosPendientes: number;
  contratosVigentes: number;
  ultimosClientes: {
    id: string;
    nombre: string;
    empresa: string | null;
    estado: string;
  }[];
  ultimosPagos: {
    id: string;
    monto: number;
    concepto: string;
    fecha: string | null;
    estado: string;
    cliente: { nombre: string };
  }[];
  contratosPorVencer: {
    id: string;
    numero: string;
    fechaVencimiento: string;
    cliente: { nombre: string };
    producto: { nombre: string };
  }[];
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-gray-200 animate-pulse rounded-lg ${className}`} />;
}

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', 'resumen'],
    queryFn: async () => {
      const { data } = await api.get<DashboardResumen>('/dashboard/resumen');
      return data;
    },
  });

  const stats = data
    ? [
        {
          label: 'Ingresos del mes',
          value: `S/ ${data.ingresosMes.toFixed(2)}`,
          icon: DollarSign,
          color: 'bg-orange/10 text-orange',
          accent: false,
        },
        {
          label: 'Clientes activos',
          value: data.clientesActivos,
          icon: Users,
          color: 'bg-blue-50 text-blue-500',
          accent: false,
        },
        {
          label: 'Sistemas activos',
          value: data.productosActivos,
          icon: Package,
          color: 'bg-purple-50 text-purple-500',
          accent: false,
        },
        {
          label: 'Pagos pendientes',
          value: data.pagosPendientes,
          icon: Clock,
          color: data.pagosPendientes > 0 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500',
          accent: data.pagosPendientes > 0,
        },
        {
          label: 'Contratos vigentes',
          value: data.contratosVigentes,
          icon: FileText,
          color: 'bg-mint text-green-600',
          accent: false,
        },
      ]
    : [];

  return (
    <>
      <Topbar title="Dashboard" />
      <main className="flex-1 p-6 space-y-6">

        {/* Error */}
        {isError && (
          <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-5 py-4">
            <p className="text-red-600 text-sm">No se pudo cargar el resumen.</p>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              <RefreshCw size={15} /> Reintentar
            </button>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-cream2">
                  <Skeleton className="w-10 h-10 mb-4" />
                  <Skeleton className="h-7 w-24 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))
            : stats.map(({ label, value, icon: Icon, color, accent }) => (
                <div
                  key={label}
                  className={`bg-white rounded-2xl p-5 border shadow-sm ${accent ? 'border-red-200' : 'border-cream2'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                    <Icon size={20} />
                  </div>
                  <p className={`text-2xl font-bold mb-1 ${accent ? 'text-red-500' : 'text-navy'}`}>
                    {value}
                  </p>
                  <p className="text-navy/40 text-xs">{label}</p>
                </div>
              ))}
        </div>

        {/* Alerta contratos por vencer */}
        {(data?.contratosPorVencer?.length ?? 0) > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-yellow-200 flex items-center gap-2">
              <AlertTriangle size={16} className="text-yellow-600" />
              <h3 className="font-semibold text-yellow-800 text-sm">
                Contratos por vencer en los próximos 15 días ({data!.contratosPorVencer.length})
              </h3>
            </div>
            <div className="divide-y divide-yellow-100">
              {data!.contratosPorVencer.map((c) => {
                const dias = Math.ceil(
                  (new Date(c.fechaVencimiento).getTime() - new Date().setHours(0,0,0,0)) / 86400000
                );
                return (
                  <div key={c.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-navy">
                        {c.cliente.nombre}
                        <span className="text-navy/40 font-normal ml-2">· {c.producto.nombre}</span>
                      </p>
                      <p className="text-xs text-navy/40">{c.numero} · Vence: {c.fechaVencimiento}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      dias <= 7 ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {dias === 0 ? 'Hoy' : dias === 1 ? 'Mañana' : `${dias} días`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tables */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Últimos clientes */}
          <div className="bg-white rounded-2xl border border-cream2 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-cream2">
              <h3 className="font-semibold text-navy text-sm">Últimos clientes</h3>
            </div>
            <div className="divide-y divide-cream2">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="px-5 py-3 flex items-center justify-between">
                      <div className="space-y-1.5">
                        <Skeleton className="h-3.5 w-28" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-5 w-14 rounded-full" />
                    </div>
                  ))
                : data?.ultimosClientes.map((c) => (
                    <div key={c.id} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-navy">{c.nombre}</p>
                        {c.empresa && <p className="text-xs text-navy/40">{c.empresa}</p>}
                      </div>
                      <Badge label={c.estado} />
                    </div>
                  ))}
              {!isLoading && data?.ultimosClientes.length === 0 && (
                <p className="px-5 py-6 text-center text-sm text-navy/30">Sin clientes aún</p>
              )}
            </div>
          </div>

          {/* Últimos pagos */}
          <div className="bg-white rounded-2xl border border-cream2 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-cream2">
              <h3 className="font-semibold text-navy text-sm">Últimos pagos</h3>
            </div>
            <div className="divide-y divide-cream2">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="px-5 py-3 flex items-center justify-between">
                      <div className="space-y-1.5">
                        <Skeleton className="h-3.5 w-28" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-3.5 w-16" />
                        <Skeleton className="h-5 w-14 rounded-full" />
                      </div>
                    </div>
                  ))
                : data?.ultimosPagos.map((p) => (
                    <div key={p.id} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-navy">{p.cliente.nombre}</p>
                        <p className="text-xs text-navy/40">{p.concepto}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-navy">
                          S/ {Number(p.monto).toFixed(2)}
                        </span>
                        <Badge label={p.estado} />
                      </div>
                    </div>
                  ))}
              {!isLoading && data?.ultimosPagos.length === 0 && (
                <p className="px-5 py-6 text-center text-sm text-navy/30">Sin pagos aún</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

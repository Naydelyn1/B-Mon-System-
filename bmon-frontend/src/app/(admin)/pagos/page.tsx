'use client';

import { useState, useMemo, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus, Trash2, Search, CheckCircle,
  TrendingUp, Clock, AlertCircle, FileText,
  ChevronDown, ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { Topbar } from '@/components/layout/Topbar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import api from '@/lib/axios';

interface Cliente { id: string; nombre: string; }
interface Contrato {
  id: string;
  numero: string;
  montoTotal: number;
  periodicidad: 'Mensual' | 'Anual';
  estado: string;
  producto: { nombre: string };
  modalidad: { nombre: string } | null;
}
interface Pago {
  id: string;
  monto: number;
  concepto: string;
  fecha: string | null;
  fechaVencimiento: string | null;
  cuotaNumero: number | null;
  cuotaTotal: number | null;
  estado: string;
  metodoPago: string | null;
  comprobante: string | null;
  notas: string | null;
  clienteId: string;
  contratoId: string | null;
  cliente: { nombre: string };
  createdAt: string;
}
interface Resumen { totalPagado: number; totalPendiente: number; totalAtrasado: number; }

const schema = z.object({
  clienteId: z.string().min(1, 'Selecciona un cliente'),
  concepto: z.string().min(1, 'Requerido'),
  monto: z.number().min(0.01, 'Debe ser mayor a 0'),
  fecha: z.string().min(1, 'Requerido'),
  metodoPago: z.enum(['Transferencia', 'Efectivo', 'Yape', 'Plin', 'Otro'], { message: 'Selecciona método' }),
  estado: z.enum(['Pagado', 'Pendiente', 'Atrasado'], { message: 'Selecciona estado' }),
  comprobante: z.string().optional(),
  notas: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-gray-200 animate-pulse rounded ${className}`} />;
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-cream2 shadow-sm flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xl font-bold text-navy">{value}</p>
        <p className="text-navy/40 text-xs">{label}</p>
      </div>
    </div>
  );
}

function mesAnio(): string {
  return new Date().toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
}

function parseProductoFromConcepto(concepto: string): string {
  const parts = concepto.split(' · ');
  if (parts.length >= 2 && !parts[1].startsWith('Cuota')) {
    return `${parts[0]} · ${parts[1]}`;
  }
  return parts[0];
}

function compositeEstado(groupPagos: Pago[]): string {
  if (groupPagos.every((p) => p.estado === 'Pagado')) return 'Pagado';
  if (groupPagos.some((p) => p.estado === 'Atrasado')) return 'Atrasado';
  return 'Pendiente';
}

export default function PagosPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Pago | null>(null);
  const [selectedClienteId, setSelectedClienteId] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const today = new Date().toISOString().slice(0, 10);

  const { data: pagos = [], isLoading } = useQuery({
    queryKey: ['pagos'],
    queryFn: async () => { const { data } = await api.get<Pago[]>('/pagos'); return data; },
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => { const { data } = await api.get<Cliente[]>('/clientes'); return data; },
  });

  const { data: resumen } = useQuery({
    queryKey: ['pagos', 'resumen'],
    queryFn: async () => { const { data } = await api.get<Resumen>('/pagos/resumen'); return data; },
  });

  const { data: contratosCliente = [] } = useQuery({
    queryKey: ['contratos', selectedClienteId],
    queryFn: async () => {
      const { data } = await api.get<Contrato[]>(`/contratos?clienteId=${selectedClienteId}`);
      return data;
    },
    enabled: !!selectedClienteId,
  });

  const contratoActivo = contratosCliente.find(
    (c) => c.estado === 'Vigente' || c.estado === 'Pendiente firma'
  );

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { fecha: today, estado: 'Pendiente' },
  });

  const handleClienteChange = (clienteId: string) => {
    setSelectedClienteId(clienteId);
    setValue('clienteId', clienteId, { shouldValidate: true });
    setValue('concepto', '');
    setValue('monto', 0);
  };

  const aplicarContrato = (contrato: Contrato) => {
    const modalidadNombre = contrato.modalidad ? ` · ${contrato.modalidad.nombre}` : '';
    const concepto = `Pago ${contrato.periodicidad.toLowerCase()} - ${contrato.producto.nombre}${modalidadNombre} - ${mesAnio()}`;
    setValue('monto', Number(contrato.montoTotal), { shouldValidate: true });
    setValue('concepto', concepto, { shouldValidate: true });
  };

  const saveMutation = useMutation({
    mutationFn: (data: FormData) => api.post('/pagos', {
      ...data,
      comprobante: data.comprobante || undefined,
      notas: data.notas || undefined,
    }),
    onSuccess: () => {
      toast.success('Pago registrado');
      qc.invalidateQueries({ queryKey: ['pagos'] });
      setModalOpen(false);
      reset({ fecha: today, estado: 'Pendiente' });
      setSelectedClienteId('');
    },
    onError: () => toast.error('Error al registrar el pago'),
  });

  const pagarMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/pagos/${id}/pagar`, {}),
    onSuccess: () => {
      toast.success('Pago marcado como pagado');
      qc.invalidateQueries({ queryKey: ['pagos'] });
    },
    onError: () => toast.error('Error al actualizar el pago'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/pagos/${id}`),
    onSuccess: () => {
      toast.success('Pago eliminado');
      qc.invalidateQueries({ queryKey: ['pagos'] });
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message;
      toast.error(typeof msg === 'string' ? msg : 'Error al eliminar el pago');
      setDeleteTarget(null);
    },
  });

  const { groups, individuals } = useMemo(() => {
    const q = search.toLowerCase();
    const matchesPago = (p: Pago) => {
      const matchSearch = p.cliente.nombre.toLowerCase().includes(q) || p.concepto.toLowerCase().includes(q);
      const matchEstado = filterEstado === 'Todos' || p.estado === filterEstado;
      return matchSearch && matchEstado;
    };

    const groupMap = new Map<string, Pago[]>();
    const inds: Pago[] = [];

    for (const p of pagos) {
      if (p.contratoId && p.cuotaTotal !== null) {
        const arr = groupMap.get(p.contratoId) ?? [];
        arr.push(p);
        groupMap.set(p.contratoId, arr);
      } else {
        inds.push(p);
      }
    }

    const filteredGroups: Array<{ contratoId: string; pagos: Pago[] }> = [];
    for (const [contratoId, gPagos] of groupMap) {
      if (gPagos.some(matchesPago)) {
        filteredGroups.push({ contratoId, pagos: gPagos });
      }
    }

    return { groups: filteredGroups, individuals: inds.filter(matchesPago) };
  }, [pagos, search, filterEstado]);

  const toggleGroup = (contratoId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(contratoId)) next.delete(contratoId);
      else next.add(contratoId);
      return next;
    });
  };

  const openCreate = () => {
    reset({ fecha: today, clienteId: '', concepto: '', monto: 0, metodoPago: undefined, estado: 'Pendiente', comprobante: '', notas: '' });
    setSelectedClienteId('');
    setModalOpen(true);
  };

  const hasResults = groups.length > 0 || individuals.length > 0;

  return (
    <>
      <Topbar title="Pagos" />
      <main className="flex-1 p-6 space-y-5">

        <div className="grid grid-cols-3 gap-4">
          <StatCard icon={TrendingUp} label="Pagado este mes" value={`S/ ${resumen?.totalPagado?.toFixed(2) ?? '0.00'}`} color="bg-green-50 text-green-600" />
          <StatCard icon={Clock} label="Pendientes" value={`S/ ${resumen?.totalPendiente?.toFixed(2) ?? '0.00'}`} color="bg-yellow-50 text-yellow-600" />
          <StatCard icon={AlertCircle} label="Atrasados" value={`S/ ${resumen?.totalAtrasado?.toFixed(2) ?? '0.00'}`} color="bg-red-50 text-red-500" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-3 flex-wrap">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..."
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-orange bg-white text-navy w-48" />
            </div>
            <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-orange bg-white text-navy">
              {['Todos', 'Pagado', 'Pendiente', 'Atrasado'].map((e) => <option key={e}>{e}</option>)}
            </select>
          </div>
          <Button onClick={openCreate}><Plus size={16} /> Registrar pago</Button>
        </div>

        <div className="bg-white rounded-2xl border border-cream2 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream2 text-navy/40 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">Cliente / Producto</th>
                <th className="text-left px-5 py-3">Vencimiento</th>
                <th className="text-left px-5 py-3">Cuota</th>
                <th className="text-left px-5 py-3">Método</th>
                <th className="text-left px-5 py-3">Monto</th>
                <th className="text-left px-5 py-3">Estado</th>
                <th className="text-right px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream2">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-5 py-3"><Skeleton className="h-4 w-full" /></td>
                    ))}</tr>
                  ))
                : (
                  <>
                    {/* Grouped accordion rows (cuotas mensuales) */}
                    {groups.map(({ contratoId, pagos: gPagos }) => {
                      const isExpanded = expandedGroups.has(contratoId);
                      const first = gPagos[0];
                      const producto = parseProductoFromConcepto(first.concepto);
                      const pagadas = gPagos.filter((p) => p.estado === 'Pagado').length;
                      const total = first.cuotaTotal ?? gPagos.length;
                      const montoTotal = gPagos.reduce((s, p) => s + Number(p.monto), 0);
                      const estado = compositeEstado(gPagos);
                      const Chevron = isExpanded ? ChevronDown : ChevronRight;

                      return (
                        <Fragment key={contratoId}>
                          {/* Group header */}
                          <tr
                            className="bg-cream/60 hover:bg-cream cursor-pointer select-none border-b border-cream2"
                            onClick={() => toggleGroup(contratoId)}
                          >
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <Chevron size={15} className="text-navy/40 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="font-semibold text-navy">{first.cliente.nombre}</p>
                                  <p className="text-xs text-navy/50 truncate">{producto}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-navy/40 text-xs italic">Contrato anual</td>
                            <td className="px-5 py-3">
                              <span className="text-xs font-semibold bg-orange/10 text-orange px-2 py-0.5 rounded-full whitespace-nowrap">
                                {pagadas}/{total} pagadas
                              </span>
                            </td>
                            <td className="px-5 py-3 text-navy/30 text-xs">—</td>
                            <td className="px-5 py-3 font-semibold text-navy">S/ {montoTotal.toFixed(2)}</td>
                            <td className="px-5 py-3"><Badge label={estado} /></td>
                            <td className="px-5 py-3" />
                          </tr>

                          {/* Cuota sub-rows */}
                          {isExpanded && gPagos.map((p) => (
                            <tr key={p.id} className="hover:bg-orange/5 transition-colors">
                              <td className="py-2.5 pl-14 pr-5">
                                <div className="flex items-center gap-2 text-navy/40">
                                  <span className="text-base leading-none">└</span>
                                  <span className="text-xs font-semibold bg-orange/10 text-orange px-1.5 py-0.5 rounded-full">
                                    {p.cuotaNumero}/{p.cuotaTotal}
                                  </span>
                                </div>
                              </td>
                              <td className="px-5 py-2.5 text-navy/60 text-xs">{p.fechaVencimiento ?? '—'}</td>
                              <td className="px-5 py-2.5" />
                              <td className="px-5 py-2.5 text-navy/60 text-xs">{p.metodoPago ?? '—'}</td>
                              <td className="px-5 py-2.5 font-medium text-navy text-xs">S/ {Number(p.monto).toFixed(2)}</td>
                              <td className="px-5 py-2.5"><Badge label={p.estado} /></td>
                              <td className="px-5 py-2.5">
                                <div className="flex justify-end">
                                  {(p.estado === 'Pendiente' || p.estado === 'Atrasado') && (
                                    <Button variant="success" size="sm"
                                      onClick={(e) => { e.stopPropagation(); pagarMutation.mutate(p.id); }}>
                                      <CheckCircle size={14} /> Pagar
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </Fragment>
                      );
                    })}

                    {/* Individual (non-cuota) pagos */}
                    {individuals.map((p) => (
                      <tr key={p.id} className="hover:bg-cream/40 transition-colors">
                        <td className="px-5 py-3">
                          <p className="font-medium text-navy">{p.cliente.nombre}</p>
                          <p className="text-xs text-navy/50 truncate max-w-xs" title={p.concepto}>{p.concepto}</p>
                        </td>
                        <td className="px-5 py-3 text-navy/60">{p.fechaVencimiento ?? p.fecha ?? '—'}</td>
                        <td className="px-5 py-3 text-navy/30 text-xs">—</td>
                        <td className="px-5 py-3 text-navy/60">{p.metodoPago ?? '—'}</td>
                        <td className="px-5 py-3 font-semibold text-navy">S/ {Number(p.monto).toFixed(2)}</td>
                        <td className="px-5 py-3"><Badge label={p.estado} /></td>
                        <td className="px-5 py-3">
                          <div className="flex justify-end gap-2">
                            {(p.estado === 'Pendiente' || p.estado === 'Atrasado') && (
                              <Button variant="success" size="sm" onClick={() => pagarMutation.mutate(p.id)}>
                                <CheckCircle size={14} /> Pagar
                              </Button>
                            )}
                            <Button variant="danger" size="sm" onClick={() => setDeleteTarget(p)}>
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {!hasResults && (
                      <tr><td colSpan={7} className="px-5 py-10 text-center text-navy/30">No hay pagos</td></tr>
                    )}
                  </>
                )
              }
            </tbody>
          </table>
        </div>
      </main>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Registrar pago"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button loading={isSubmitting} onClick={handleSubmit((d) => saveMutation.mutate(d))}>Guardar</Button>
          </>
        }
      >
        <form className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-navy">Cliente *</label>
            <select
              {...register('clienteId')}
              onChange={(e) => handleClienteChange(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border text-sm outline-none bg-white text-navy
                ${errors.clienteId ? 'border-red-400' : 'border-gray-200 focus:border-orange'}`}>
              <option value="">Seleccionar...</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            {errors.clienteId && <p className="text-xs text-red-500">{errors.clienteId.message}</p>}
          </div>

          {selectedClienteId && contratoActivo && (
            <div className="bg-mint border border-green-200 rounded-xl p-3 flex items-start gap-3">
              <FileText size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-navy">
                  Contrato {contratoActivo.numero} · {contratoActivo.periodicidad}
                </p>
                <p className="text-xs text-navy/60 truncate">
                  {contratoActivo.producto.nombre}{contratoActivo.modalidad ? ` · ${contratoActivo.modalidad.nombre}` : ''} · S/ {Number(contratoActivo.montoTotal).toFixed(2)}
                </p>
              </div>
              <button type="button" onClick={() => aplicarContrato(contratoActivo)}
                className="text-xs text-orange font-semibold hover:text-orange2 whitespace-nowrap">
                Aplicar →
              </button>
            </div>
          )}
          {selectedClienteId && !contratoActivo && contratosCliente.length === 0 && (
            <p className="text-xs text-navy/40 bg-gray-50 rounded-xl px-3 py-2">
              Este cliente no tiene contratos activos
            </p>
          )}

          <Input label="Concepto *" error={errors.concepto?.message} {...register('concepto')} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Monto (S/) *" type="number" step="0.01" error={errors.monto?.message}
              {...register('monto', { valueAsNumber: true })} />
            <Input label="Fecha *" type="date" error={errors.fecha?.message} {...register('fecha')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-navy">Método de pago *</label>
              <select {...register('metodoPago')}
                className={`w-full px-3 py-2 rounded-lg border text-sm outline-none bg-white text-navy
                  ${errors.metodoPago ? 'border-red-400' : 'border-gray-200 focus:border-orange'}`}>
                <option value="">Seleccionar...</option>
                {['Transferencia', 'Efectivo', 'Yape', 'Plin', 'Otro'].map((m) => <option key={m}>{m}</option>)}
              </select>
              {errors.metodoPago && <p className="text-xs text-red-500">{errors.metodoPago.message}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-navy">Estado *</label>
              <select {...register('estado')}
                className={`w-full px-3 py-2 rounded-lg border text-sm outline-none bg-white text-navy
                  ${errors.estado ? 'border-red-400' : 'border-gray-200 focus:border-orange'}`}>
                {['Pagado', 'Pendiente', 'Atrasado'].map((e) => <option key={e}>{e}</option>)}
              </select>
              {errors.estado && <p className="text-xs text-red-500">{errors.estado.message}</p>}
            </div>
          </div>

          <Input label="N° Comprobante" {...register('comprobante')} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-navy">Notas</label>
            <textarea {...register('notas')} rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-orange text-sm outline-none bg-white text-navy resize-none" />
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
        title="Eliminar pago"
        message={`¿Seguro que deseas eliminar este pago de "${deleteTarget?.cliente.nombre}"?`} />
    </>
  );
}

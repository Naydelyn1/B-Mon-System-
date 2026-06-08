'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Search, Pencil, ChevronDown, X as XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Topbar } from '@/components/layout/Topbar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import api from '@/lib/axios';

interface Modalidad { id: string; nombre: string; precio: number; }
interface Producto { id: string; nombre: string; modalidades: Modalidad[]; }
interface Cliente { id: string; nombre: string; }
interface Contrato {
  id: string;
  numero: string;
  clienteId: string;
  productoId: string;
  modalidadId: string | null;
  periodicidad: string;
  facturacion: string | null;
  descuento: number;
  montoTotal: number;
  fechaInicio: string;
  fechaVencimiento: string;
  estado: string;
  descripcion: string | null;
  cliente: { nombre: string };
  producto: { nombre: string };
  modalidad: { nombre: string } | null;
}

const schema = z.object({
  clienteId: z.string().min(1, 'Selecciona un cliente'),
  productoId: z.string().min(1, 'Selecciona un sistema'),
  modalidadId: z.string().optional(),
  periodicidad: z.enum(['Mensual', 'Anual']),
  facturacion: z.enum(['Pago único', 'Cuotas mensuales']).optional(),
  descuento: z.number().min(0).max(100).optional(),
  montoTotal: z.number().min(0, 'Debe ser mayor o igual a 0'),
  fechaInicio: z.string().min(1, 'Requerido'),
  fechaVencimiento: z.string().min(1, 'Requerido'),
  estado: z.enum(['Vigente', 'Pendiente firma', 'Vencido', 'Cancelado'], { message: 'Selecciona un estado' }),
  descripcion: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-gray-200 animate-pulse rounded ${className}`} />;
}

function addPeriod(date: string, periodicidad: 'Mensual' | 'Anual'): string {
  const d = new Date(date);
  if (periodicidad === 'Mensual') d.setMonth(d.getMonth() + 1);
  else d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

function ClienteCombobox({
  clientes,
  value,
  onChange,
  error,
}: {
  clientes: Cliente[];
  value: string;
  onChange: (id: string) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const selected = clientes.find((c) => c.id === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtrados = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (c: Cliente) => {
    onChange(c.id);
    setQuery('');
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setQuery('');
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm bg-white text-navy text-left
          ${error ? 'border-red-400' : 'border-gray-200 focus:border-orange'}`}
      >
        <span className={selected ? 'text-navy' : 'text-navy/40'}>
          {selected ? selected.nombre : 'Seleccionar...'}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {selected && (
            <span onClick={handleClear} className="text-navy/30 hover:text-navy/60 p-0.5 rounded">
              <XIcon size={12} />
            </span>
          )}
          <ChevronDown size={14} className={`text-navy/40 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar cliente..."
                className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-200 rounded-md outline-none focus:border-orange bg-white text-navy"
              />
            </div>
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {filtrados.length === 0
              ? <li className="px-3 py-2 text-sm text-navy/40">Sin resultados</li>
              : filtrados.map((c) => (
                <li
                  key={c.id}
                  onClick={() => handleSelect(c)}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-cream/60 transition-colors
                    ${c.id === value ? 'bg-orange/10 text-orange font-medium' : 'text-navy'}`}
                >
                  {c.nombre}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function ContratosPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Contrato | null>(null);
  const [editTarget, setEditTarget] = useState<Contrato | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  const { data: contratos = [], isLoading } = useQuery({
    queryKey: ['contratos'],
    queryFn: async () => { const { data } = await api.get<Contrato[]>('/contratos'); return data; },
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => { const { data } = await api.get<Cliente[]>('/clientes'); return data; },
  });

  const { data: productos = [] } = useQuery({
    queryKey: ['productos'],
    queryFn: async () => { const { data } = await api.get<Producto[]>('/productos'); return data; },
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { fechaInicio: today, fechaVencimiento: addPeriod(today, 'Mensual'), periodicidad: 'Mensual', estado: 'Pendiente firma', montoTotal: 0 },
  });

  const clienteId = watch('clienteId');
  const productoId = watch('productoId');
  const modalidadId = watch('modalidadId');
  const periodicidad = watch('periodicidad');
  const fechaInicio = watch('fechaInicio');
  const descuento = watch('descuento') ?? 0;

  const productoSeleccionado = productos.find((p) => p.id === productoId);
  const modalidadSeleccionada = productoSeleccionado?.modalidades?.find((m) => m.id === modalidadId);
  const esLicenciaUnica = modalidadSeleccionada?.nombre === 'Licencia única';

  const calcularMonto = (precioBase: number, meses: number, desc: number): number => {
    const base = precioBase * meses;
    return Math.round(base * (1 - desc / 100) * 100) / 100;
  };

  const autoSelectModalidad = (prod: Producto | undefined, per: 'Mensual' | 'Anual', desc = descuento) => {
    if (prod?.modalidades?.length === 1) {
      const unica = prod.modalidades[0];
      setValue('modalidadId', unica.id, { shouldValidate: true });
      const meses = (per === 'Anual' && unica.nombre !== 'Licencia única') ? 12 : 1;
      setValue('montoTotal', calcularMonto(Number(unica.precio), meses, desc), { shouldValidate: true });
    } else {
      setValue('modalidadId', '', { shouldValidate: false });
      setValue('montoTotal', 0, { shouldValidate: false });
    }
  };

  const handleProductoChange = (id: string, per: 'Mensual' | 'Anual') => {
    setValue('fechaVencimiento', addPeriod(fechaInicio || today, per));
    const prod = productos.find((x) => x.id === id);
    autoSelectModalidad(prod, per);
  };

  const handleModalidadChange = (mid: string, per: 'Mensual' | 'Anual', desc = descuento) => {
    const prod = productos.find((x) => x.id === productoId);
    const modalidad = prod?.modalidades?.find((m) => m.id === mid);
    if (modalidad) {
      const meses = (per === 'Anual' && modalidad.nombre !== 'Licencia única') ? 12 : 1;
      setValue('montoTotal', calcularMonto(Number(modalidad.precio), meses, desc), { shouldValidate: true });
    }
  };

  const handleDescuentoChange = (val: number) => {
    if (modalidadSeleccionada) {
      const meses = (periodicidad === 'Anual' && modalidadSeleccionada.nombre !== 'Licencia única') ? 12 : 1;
      setValue('montoTotal', calcularMonto(Number(modalidadSeleccionada.precio), meses, val), { shouldValidate: true });
    }
  };

  const saveMutation = useMutation({
    mutationFn: (data: FormData) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { descripcion, facturacion, descuento, ...rest } = data;
      const payload = {
        ...rest,
        descripcion: descripcion || undefined,
        facturacion: data.periodicidad === 'Anual' ? facturacion : undefined,
        descuento: descuento ?? 0,
      };
      if (editTarget) return api.patch(`/contratos/${editTarget.id}`, payload);
      return api.post('/contratos', payload);
    },
    onSuccess: () => {
      toast.success(editTarget ? 'Contrato actualizado' : 'Contrato creado');
      qc.invalidateQueries({ queryKey: ['contratos'] });
      setModalOpen(false);
      setEditTarget(null);
    },
    onError: () => toast.error(editTarget ? 'Error al actualizar' : 'Error al crear el contrato'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/contratos/${id}`),
    onSuccess: () => {
      toast.success('Contrato eliminado');
      qc.invalidateQueries({ queryKey: ['contratos'] });
      setDeleteTarget(null);
    },
    onError: () => toast.error('Error al eliminar el contrato'),
  });

  const openCreate = () => {
    setEditTarget(null);
    reset({ fechaInicio: today, fechaVencimiento: addPeriod(today, 'Mensual'), periodicidad: 'Mensual', facturacion: 'Pago único', descuento: 0, clienteId: '', productoId: '', modalidadId: '', montoTotal: 0, estado: 'Pendiente firma', descripcion: '' });
    setModalOpen(true);
  };

  const openEdit = (c: Contrato) => {
    setEditTarget(c);
    reset({
      clienteId: c.clienteId,
      productoId: c.productoId,
      modalidadId: c.modalidadId ?? '',
      periodicidad: (c.periodicidad as 'Mensual' | 'Anual') ?? 'Mensual',
      facturacion: (c.facturacion as FormData['facturacion']) ?? 'Pago único',
      descuento: Number(c.descuento ?? 0),
      montoTotal: Number(c.montoTotal),
      fechaInicio: c.fechaInicio,
      fechaVencimiento: c.fechaVencimiento,
      estado: c.estado as FormData['estado'],
      descripcion: c.descripcion ?? '',
    });
    setModalOpen(true);
  };

  const filtered = contratos.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = c.numero.toLowerCase().includes(q) || c.cliente.nombre.toLowerCase().includes(q);
    const matchEstado = filterEstado === 'Todos' || c.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  // suppress unused warning — clienteId is used for the combobox value
  void clienteId;

  return (
    <>
      <Topbar title="Contratos" />
      <main className="flex-1 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex gap-3 flex-wrap">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar contrato..."
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-orange bg-white text-navy w-52" />
            </div>
            <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-orange bg-white text-navy">
              {['Todos', 'Vigente', 'Pendiente firma', 'Vencido', 'Cancelado'].map((e) => <option key={e}>{e}</option>)}
            </select>
          </div>
          <Button onClick={openCreate}><Plus size={16} /> Nuevo contrato</Button>
        </div>

        <div className="bg-white rounded-2xl border border-cream2 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream2 text-navy/40 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">N° Contrato</th>
                <th className="text-left px-5 py-3">Cliente</th>
                <th className="text-left px-5 py-3">Sistema</th>
                <th className="text-left px-5 py-3">Monto total</th>
                <th className="text-left px-5 py-3">Vencimiento</th>
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
                : filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-cream/40 transition-colors">
                      <td className="px-5 py-3 font-mono text-navy font-medium">{c.numero}</td>
                      <td className="px-5 py-3 text-navy">{c.cliente?.nombre ?? '—'}</td>
                      <td className="px-5 py-3 text-navy/60">
                        {c.producto?.nombre ?? '—'}
                        {c.modalidad && <span className="text-xs text-navy/40 ml-1">· {c.modalidad.nombre}</span>}
                      </td>
                      <td className="px-5 py-3 font-semibold text-navy">S/ {Number(c.montoTotal).toFixed(2)}</td>
                      <td className="px-5 py-3 text-navy/60">{c.fechaVencimiento}</td>
                      <td className="px-5 py-3"><Badge label={c.estado} /></td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>
                            <Pencil size={14} />
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => setDeleteTarget(c)}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-navy/30">No hay contratos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditTarget(null); }} title={editTarget ? 'Editar contrato' : 'Nuevo contrato'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button loading={isSubmitting} onClick={handleSubmit((d) => saveMutation.mutate(d))}>Guardar</Button>
          </>
        }
      >
        <form className="space-y-4">
          {/* Cliente */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-navy">Cliente *</label>
            <ClienteCombobox
              clientes={clientes}
              value={clienteId}
              onChange={(id) => setValue('clienteId', id, { shouldValidate: true })}
              error={errors.clienteId?.message}
            />
            {errors.clienteId && <p className="text-xs text-red-500">{errors.clienteId.message}</p>}
          </div>

          {/* Sistema */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-navy">Sistema *</label>
            <select
              {...register('productoId')}
              onChange={(e) => {
                register('productoId').onChange(e);
                handleProductoChange(e.target.value, periodicidad);
              }}
              className={`w-full px-3 py-2 rounded-lg border text-sm outline-none bg-white text-navy
                ${errors.productoId ? 'border-red-400' : 'border-gray-200 focus:border-orange'}`}>
              <option value="">Seleccionar...</option>
              {productos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            {errors.productoId && <p className="text-xs text-red-500">{errors.productoId.message}</p>}
          </div>

          {/* Modalidad */}
          {productoSeleccionado && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-navy">Modalidad *</label>
              <select
                {...register('modalidadId')}
                onChange={(e) => {
                  register('modalidadId').onChange(e);
                  handleModalidadChange(e.target.value, periodicidad);
                }}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-orange text-sm outline-none bg-white text-navy">
                <option value="">Seleccionar modalidad...</option>
                {productoSeleccionado.modalidades?.map((m) => (
                  <option key={m.id} value={m.id}>{m.nombre} — S/ {Number(m.precio).toFixed(2)}</option>
                ))}
              </select>
            </div>
          )}

          {/* Periodicidad — oculta para Licencia única */}
          {!esLicenciaUnica && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-navy">Periodicidad *</label>
              <select
                {...register('periodicidad')}
                onChange={(e) => {
                  register('periodicidad').onChange(e);
                  const per = e.target.value as 'Mensual' | 'Anual';
                  setValue('fechaVencimiento', addPeriod(fechaInicio || today, per));
                  if (modalidadId) handleModalidadChange(modalidadId, per);
                  if (per === 'Mensual') setValue('facturacion', 'Pago único');
                }}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-orange text-sm outline-none bg-white text-navy">
                <option value="Mensual">Mensual</option>
                <option value="Anual">Anual (×12)</option>
              </select>
            </div>
          )}

          {/* Facturación — solo para contratos anuales */}
          {periodicidad === 'Anual' && !esLicenciaUnica && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-navy">Facturación *</label>
              <select
                {...register('facturacion')}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-orange text-sm outline-none bg-white text-navy">
                <option value="Pago único">Pago único (S/ {watch('montoTotal')?.toFixed(2) ?? '0.00'} de una vez)</option>
                <option value="Cuotas mensuales">Cuotas mensuales (12 × S/ {((watch('montoTotal') ?? 0) / 12).toFixed(2)})</option>
              </select>
              <p className="text-xs text-navy/40">Define si el cliente paga todo junto o en 12 cuotas mensuales fijas</p>
            </div>
          )}

          {/* Descuento opcional */}
          {modalidadSeleccionada && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-navy">Descuento (%)</label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  placeholder="0"
                  {...register('descuento', { valueAsNumber: true })}
                  onChange={(e) => {
                    register('descuento', { valueAsNumber: true }).onChange(e);
                    handleDescuentoChange(Number(e.target.value) || 0);
                  }}
                  className="w-full px-3 py-2 pr-8 rounded-lg border border-gray-200 focus:border-orange text-sm outline-none bg-white text-navy"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-navy/40 text-sm">%</span>
              </div>
            </div>
          )}

          {/* Monto total — solo lectura */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-navy">Monto total (S/)</label>
            <input
              type="text"
              readOnly
              value={`S/ ${(watch('montoTotal') ?? 0).toFixed(2)}`}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50 text-navy font-semibold cursor-default"
            />
            {modalidadSeleccionada && (
              <div className="text-xs text-navy/40 space-y-0.5">
                {(() => {
                  const meses = (periodicidad === 'Anual' && modalidadSeleccionada.nombre !== 'Licencia única') ? 12 : 1;
                  const base = Number(modalidadSeleccionada.precio) * meses;
                  const desc = descuento ?? 0;
                  const ahorro = base * (desc / 100);
                  return (
                    <>
                      <p>Base: S/ {Number(modalidadSeleccionada.precio).toFixed(2)} × {meses} {meses > 1 ? 'meses' : 'mes'} = S/ {base.toFixed(2)}</p>
                      {desc > 0 && <p className="text-green-600">− {desc}% descuento = − S/ {ahorro.toFixed(2)}</p>}
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Fecha inicio *" type="date" error={errors.fechaInicio?.message} {...register('fechaInicio')} />
            <Input label="Fecha vencimiento *" type="date" error={errors.fechaVencimiento?.message} {...register('fechaVencimiento')} />
          </div>

          {/* Estado */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-navy">Estado *</label>
            <select {...register('estado')}
              className={`w-full px-3 py-2 rounded-lg border text-sm outline-none bg-white text-navy
                ${errors.estado ? 'border-red-400' : 'border-gray-200 focus:border-orange'}`}>
              {['Vigente', 'Pendiente firma', 'Vencido', 'Cancelado'].map((e) => <option key={e}>{e}</option>)}
            </select>
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-navy">Descripción</label>
            <textarea {...register('descripcion')} rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-orange text-sm outline-none bg-white text-navy resize-none" />
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
        title="Eliminar contrato"
        message={`¿Seguro que deseas eliminar el contrato "${deleteTarget?.numero}"?`} />
    </>
  );
}

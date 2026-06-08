'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Search, X, CreditCard, Loader2, Power, PowerOff } from 'lucide-react';
import { toast } from 'sonner';
import { Topbar } from '@/components/layout/Topbar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import api from '@/lib/axios';

interface Pago { id: string; monto: number; concepto: string; estado: string; fecha: string | null; }
interface Cliente {
  id: string;
  nombre: string;
  empresa: string | null;
  email: string;
  telefono: string | null;
  estado: string;
  notas: string | null;
  createdAt: string;
}

const schema = z.object({
  nombre: z.string().min(1, 'Requerido'),
  empresa: z.string().optional(),
  email: z.string().email('Email inválido'),
  telefono: z.string().optional(),
  estado: z.enum(['Activo', 'Inactivo', 'Prueba'], { message: 'Selecciona un estado' }),
  notas: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-gray-200 animate-pulse rounded ${className}`} />;
}

export default function ClientesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Cliente | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cliente | null>(null);
  const [drawer, setDrawer] = useState<Cliente | null>(null);
  const [documento, setDocumento] = useState('');
  const [dniLoading, setDniLoading] = useState(false);

  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => { const { data } = await api.get<Cliente[]>('/clientes'); return data; },
  });

  const { data: pagosDrawer = [], isLoading: loadingPagos } = useQuery({
    queryKey: ['pagos', 'cliente', drawer?.id],
    queryFn: async () => {
      const { data } = await api.get<Pago[]>(`/pagos?clienteId=${drawer!.id}`);
      return data;
    },
    enabled: !!drawer,
  });

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const buscarDocumento = async (num: string) => {
    if (num.length !== 8 && num.length !== 11) return;
    setDniLoading(true);
    try {
      const { data } = await api.get<{ nombre: string; empresa?: string; tipo: string }>(
        `/clientes/consulta/${num}`
      );
      setValue('nombre', data.nombre, { shouldValidate: true });
      if (data.empresa) setValue('empresa', data.empresa, { shouldValidate: true });
    } catch {
      toast.error('No se encontró el documento');
    } finally {
      setDniLoading(false);
    }
  };

  const openCreate = () => {
    setEditTarget(null);
    reset({ nombre: '', empresa: '', email: '', telefono: '', estado: undefined, notas: '' });
    setDocumento('');
    setModalOpen(true);
  };

  const openEdit = (c: Cliente) => {
    setEditTarget(c);
    reset({
      nombre: c.nombre, empresa: c.empresa ?? '', email: c.email,
      telefono: c.telefono ?? '', estado: c.estado as FormData['estado'], notas: c.notas ?? '',
    });
    setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: (data: FormData) => editTarget
      ? api.patch(`/clientes/${editTarget.id}`, data)
      : api.post('/clientes', data),
    onSuccess: () => {
      toast.success(editTarget ? 'Cliente actualizado' : 'Cliente creado');
      qc.invalidateQueries({ queryKey: ['clientes'] });
      setModalOpen(false);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Error al guardar el cliente';
      toast.error(typeof msg === 'string' ? msg : 'Error al guardar el cliente');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/clientes/${id}`),
    onSuccess: () => {
      toast.success('Cliente eliminado');
      qc.invalidateQueries({ queryKey: ['clientes'] });
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Error al eliminar el cliente';
      toast.error(typeof msg === 'string' ? msg : 'Error al eliminar el cliente');
    },
  });

  const toggleEstadoMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/clientes/${id}/toggle-estado`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clientes'] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'No se puede cambiar el estado';
      toast.error(typeof msg === 'string' ? msg : 'No se puede cambiar el estado');
    },
  });

  const filtered = clientes.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = c.nombre.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    const matchEstado = filterEstado === 'Todos' || c.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  return (
    <>
      <Topbar title="Clientes" />
      <main className="flex-1 p-6 space-y-5 overflow-hidden">
        <div className="flex items-center justify-between">
          <div />
          <Button onClick={openCreate}><Plus size={16} /> Nuevo cliente</Button>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar cliente..."
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-orange bg-white text-navy w-56" />
          </div>
          <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-orange bg-white text-navy">
            {['Todos', 'Activo', 'Inactivo', 'Prueba'].map((e) => <option key={e}>{e}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-2xl border border-cream2 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream2 text-navy/40 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">Cliente</th>
                <th className="text-left px-5 py-3">Email</th>
                <th className="text-left px-5 py-3">Teléfono</th>
                <th className="text-left px-5 py-3">Estado</th>
                <th className="text-right px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream2">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="px-5 py-3"><Skeleton className="h-4 w-full" /></td>
                    ))}</tr>
                  ))
                : filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-cream/40 transition-colors cursor-pointer"
                      onClick={() => setDrawer(c)}>
                      <td className="px-5 py-3">
                        <p className="font-medium text-navy">{c.nombre}</p>
                        {c.empresa && <p className="text-xs text-navy/40">{c.empresa}</p>}
                      </td>
                      <td className="px-5 py-3 text-navy/60">{c.email}</td>
                      <td className="px-5 py-3 text-navy/60">{c.telefono ?? '—'}</td>
                      <td className="px-5 py-3"><Badge label={c.estado} /></td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>
                            <Pencil size={14} /> Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title={c.estado === 'Activo' ? 'Inactivar cliente' : 'Activar cliente'}
                            onClick={() => toggleEstadoMutation.mutate(c.id)}
                          >
                            {c.estado === 'Activo'
                              ? <PowerOff size={14} className="text-orange" />
                              : <Power size={14} className="text-green-500" />}
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => setDeleteTarget(c)}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-navy/30">No hay clientes</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Drawer detalle */}
      {drawer && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setDrawer(null)} />
          <div className="relative w-full max-w-sm bg-white shadow-2xl flex flex-col h-full overflow-y-auto">
            <div className="px-5 py-4 border-b border-cream2 flex items-center justify-between">
              <h3 className="font-semibold text-navy">{drawer.nombre}</h3>
              <button onClick={() => setDrawer(null)} className="text-gray-400 hover:text-navy"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4 flex-1">
              <div className="space-y-2 text-sm">
                {drawer.empresa && <p><span className="text-navy/40">Empresa: </span><span className="text-navy">{drawer.empresa}</span></p>}
                <p><span className="text-navy/40">Email: </span><span className="text-navy">{drawer.email}</span></p>
                {drawer.telefono && <p><span className="text-navy/40">Teléfono: </span><span className="text-navy">{drawer.telefono}</span></p>}
                <p className="flex items-center gap-2"><span className="text-navy/40">Estado: </span><Badge label={drawer.estado} /></p>
                {drawer.notas && <p><span className="text-navy/40">Notas: </span><span className="text-navy">{drawer.notas}</span></p>}
              </div>

              <div className="border-t border-cream2 pt-4">
                <p className="text-xs font-semibold text-navy/40 uppercase tracking-wider mb-3">Últimos pagos</p>
                {loadingPagos
                  ? <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
                  : pagosDrawer.length === 0
                    ? <p className="text-xs text-navy/30">Sin pagos registrados</p>
                    : pagosDrawer.slice(0, 3).map((p) => (
                        <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-cream2 last:border-0">
                          <div>
                            <p className="text-xs font-medium text-navy">{p.concepto}</p>
                            <p className="text-xs text-navy/40">{p.fecha ?? '—'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-navy">S/ {Number(p.monto).toFixed(2)}</span>
                            <Badge label={p.estado} />
                          </div>
                        </div>
                      ))}
              </div>
            </div>
            <div className="p-5 border-t border-cream2">
              <Button variant="ghost" size="sm" onClick={() => { openEdit(drawer); setDrawer(null); }}>
                <CreditCard size={14} /> Editar cliente
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal crear/editar */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editTarget ? 'Editar cliente' : 'Nuevo cliente'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button loading={isSubmitting} onClick={handleSubmit((d) => saveMutation.mutate(d))}>Guardar</Button>
          </>
        }
      >
        <form className="space-y-4">
          {!editTarget && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-navy">DNI o RUC</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={11}
                  placeholder="8 dígitos (DNI) o 11 (RUC)"
                  value={documento}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setDocumento(val);
                    if (val.length === 8 || val.length === 11) buscarDocumento(val);
                  }}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-orange text-sm outline-none bg-white text-navy"
                />
                {dniLoading && <Loader2 size={18} className="animate-spin text-orange self-center flex-shrink-0" />}
              </div>
              <p className="text-xs text-navy/40">Auto-rellena nombre y empresa al ingresar el número</p>
            </div>
          )}
          <Input label="Nombre *" error={errors.nombre?.message} {...register('nombre')} />
          <Input label="Empresa" {...register('empresa')} />
          <Input label="Email *" type="email" error={errors.email?.message} {...register('email')} />
          <Input label="Teléfono" {...register('telefono')} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-navy">Estado *</label>
            <select {...register('estado')}
              className={`w-full px-3 py-2 rounded-lg border text-sm outline-none bg-white text-navy
                ${errors.estado ? 'border-red-400' : 'border-gray-200 focus:border-orange'}`}>
              <option value="">Seleccionar...</option>
              {['Activo', 'Inactivo', 'Prueba'].map((e) => <option key={e}>{e}</option>)}
            </select>
            {errors.estado && <p className="text-xs text-red-500">{errors.estado.message}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-navy">Notas</label>
            <textarea {...register('notas')} rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-orange text-sm outline-none bg-white text-navy resize-none" />
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
        title="Eliminar cliente"
        message={`¿Seguro que deseas eliminar "${deleteTarget?.nombre}"?`} />
    </>
  );
}

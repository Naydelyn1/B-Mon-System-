'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Search, ImagePlus, X, PlusCircle, PowerOff, Power } from 'lucide-react';
import { toast } from 'sonner';
import { Topbar } from '@/components/layout/Topbar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import api from '@/lib/axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL!.replace('/api', '');

const TIPOS_MODALIDAD = [
  'A medida',
  'Licencia única',
  'SaaS Mensual',
  'SaaS Anual',
  'Por usuario',
  'Mantenimiento',
];

interface Modalidad {
  id: string;
  nombre: string;
  precio: number;
}

interface Producto {
  id: string;
  nombre: string;
  descripcion: string | null;
  estado: string;
  imagenUrl: string | null;
  modalidades: Modalidad[];
}

const modalidadSchema = z.object({
  nombre: z.string().min(1, 'Requerido').max(100),
  precio: z.number().min(0, 'Debe ser ≥ 0'),
});

const schema = z.object({
  nombre: z.string().min(1, 'Requerido').max(100, 'Máximo 100 caracteres'),
  descripcion: z.string().optional(),
  estado: z.enum(['Activo', 'Borrador', 'Descontinuado'], { message: 'Selecciona un estado' }),
  modalidades: z.array(modalidadSchema).min(1, 'Agrega al menos una modalidad'),
});

type FormData = z.infer<typeof schema>;

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-gray-200 animate-pulse rounded ${className}`} />;
}

export default function ProductosPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Producto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Producto | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: productos = [], isLoading } = useQuery({
    queryKey: ['productos'],
    queryFn: async () => {
      const { data } = await api.get<Producto[]>('/productos');
      return data;
    },
  });

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { modalidades: [{ nombre: '', precio: 0 }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'modalidades' });

  const resetImageState = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const openCreate = () => {
    setEditTarget(null);
    reset({ nombre: '', descripcion: '', estado: undefined, modalidades: [{ nombre: '', precio: 0 }] });
    resetImageState();
    setModalOpen(true);
  };

  const openEdit = (p: Producto) => {
    setEditTarget(p);
    reset({
      nombre: p.nombre,
      descripcion: p.descripcion ?? '',
      estado: p.estado as FormData['estado'],
      modalidades: p.modalidades.length
        ? p.modalidades.map((m) => ({ nombre: m.nombre, precio: Number(m.precio) }))
        : [{ nombre: '', precio: 0 }],
    });
    resetImageState();
    setImagePreview(p.imagenUrl ? `${API_BASE}${p.imagenUrl}` : null);
    setModalOpen(true);
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      let productId: string;
      if (editTarget) {
        await api.patch(`/productos/${editTarget.id}`, data);
        productId = editTarget.id;
      } else {
        const res = await api.post<Producto>('/productos', data);
        productId = res.data.id;
      }
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        await api.patch(`/productos/${productId}/imagen`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
    },
    onSuccess: () => {
      toast.success(editTarget ? 'Producto actualizado' : 'Producto creado');
      qc.invalidateQueries({ queryKey: ['productos'] });
      setModalOpen(false);
    },
    onError: () => toast.error('Error al guardar el producto'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/productos/${id}`),
    onSuccess: () => {
      toast.success('Producto eliminado');
      qc.invalidateQueries({ queryKey: ['productos'] });
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Error al eliminar el producto';
      toast.error(msg);
    },
  });

  const toggleEstadoMutation = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: string }) =>
      api.patch(`/productos/${id}`, { estado }),
    onSuccess: (_data, { estado }) => {
      toast.success(estado === 'Activo' ? 'Producto activado' : 'Producto desactivado');
      qc.invalidateQueries({ queryKey: ['productos'] });
    },
    onError: () => toast.error('Error al cambiar el estado'),
  });

  const filtered = productos.filter((p) => {
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase());
    const matchEstado = filterEstado === 'Todos' || p.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  const precioMin = (modalidades: Modalidad[]) =>
    modalidades.length ? Math.min(...modalidades.map((m) => Number(m.precio))) : null;

  return (
    <>
      <Topbar title="Productos" />
      <main className="flex-1 p-6 space-y-5">

        <div className="flex items-center justify-between">
          <div />
          <Button onClick={openCreate}>
            <Plus size={16} /> Nuevo producto
          </Button>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto..."
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-orange bg-white text-navy w-56"
            />
          </div>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-orange bg-white text-navy"
          >
            {['Todos', 'Activo', 'Borrador', 'Descontinuado'].map((e) => (
              <option key={e}>{e}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-cream2 overflow-hidden shadow-sm">
                <Skeleton className="w-full h-40 rounded-none" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-navy/30 text-sm">No hay productos</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((p) => {
              const min = precioMin(p.modalidades);
              return (
                <div key={p.id} className="bg-white rounded-2xl border border-cream2 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                  <div className="relative w-full h-40 bg-cream2/60 flex-shrink-0">
                    {p.imagenUrl ? (
                      <img src={`${API_BASE}${p.imagenUrl}`} alt={p.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-5xl font-bold text-navy/15">{p.nombre.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge label={p.estado} />
                    </div>
                  </div>

                  <div className="p-3 flex flex-col flex-1 gap-2">
                    <p className="font-semibold text-navy text-sm leading-tight line-clamp-2">{p.nombre}</p>

                    {/* Modalidades */}
                    {p.modalidades.length > 0 && (
                      <div className="space-y-1">
                        {p.modalidades.map((m) => (
                          <div key={m.id} className="flex items-center justify-between gap-1">
                            <span className="text-xs text-navy/50 truncate">{m.nombre}</span>
                            <span className="text-xs font-semibold text-orange whitespace-nowrap">
                              S/ {Number(m.precio).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {min !== null && p.modalidades.length > 1 && (
                      <p className="text-xs text-navy/30 mt-auto">Desde S/ {min.toFixed(2)}</p>
                    )}

                    <div className="flex gap-1.5 mt-auto pt-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(p)} className="flex-1 justify-center">
                        <Pencil size={13} /> Editar
                      </Button>
                      {p.estado === 'Activo' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Desactivar"
                          onClick={() => toggleEstadoMutation.mutate({ id: p.id, estado: 'Descontinuado' })}
                          className="text-orange/70 hover:text-orange"
                        >
                          <PowerOff size={13} />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Activar"
                          onClick={() => toggleEstadoMutation.mutate({ id: p.id, estado: 'Activo' })}
                          className="text-green-500 hover:text-green-600"
                        >
                          <Power size={13} />
                        </Button>
                      )}
                      <Button variant="danger" size="sm" onClick={() => setDeleteTarget(p)}>
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Editar producto' : 'Nuevo producto'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button loading={isSubmitting} onClick={handleSubmit((d) => saveMutation.mutate(d))}>
              Guardar
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          {/* Imagen */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-navy">Imagen referencial</label>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)} />
            {imagePreview ? (
              <div className="relative w-full h-36 rounded-xl overflow-hidden border border-cream2 group">
                <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="text-white text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                    Cambiar
                  </button>
                  <button type="button" onClick={resetImageState}
                    className="text-white p-1.5 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm">
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="w-full h-28 rounded-xl border-2 border-dashed border-gray-200 hover:border-orange/60 hover:bg-orange/5 transition-colors flex flex-col items-center justify-center gap-2 text-navy/40 hover:text-orange/70">
                <ImagePlus size={24} />
                <span className="text-xs">Haz clic para subir imagen</span>
                <span className="text-xs opacity-60">PNG, JPG hasta 2 MB</span>
              </button>
            )}
          </div>

          <Input label="Nombre" error={errors.nombre?.message} {...register('nombre')} />

          {/* Modalidades */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-navy">Modalidades y precios</label>
              <button type="button" onClick={() => append({ nombre: '', precio: 0 })}
                className="flex items-center gap-1 text-xs text-orange hover:text-orange/80 font-medium">
                <PlusCircle size={14} /> Agregar
              </button>
            </div>
            {errors.modalidades?.root && (
              <p className="text-xs text-red-500">{errors.modalidades.root.message}</p>
            )}
            {typeof errors.modalidades?.message === 'string' && (
              <p className="text-xs text-red-500">{errors.modalidades.message}</p>
            )}
            <div className="space-y-2">
              {fields.map((field, idx) => (
                <div key={field.id} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <select
                      {...register(`modalidades.${idx}.nombre`)}
                      className={`w-full px-3 py-2 rounded-lg border text-sm outline-none bg-white text-navy
                        ${errors.modalidades?.[idx]?.nombre ? 'border-red-400' : 'border-gray-200 focus:border-orange'}`}
                    >
                      <option value="">Seleccionar...</option>
                      {TIPOS_MODALIDAD.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    {errors.modalidades?.[idx]?.nombre && (
                      <p className="text-xs text-red-500 mt-0.5">{errors.modalidades[idx]?.nombre?.message}</p>
                    )}
                  </div>
                  <div className="w-32">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-navy/40">S/</span>
                      <input
                        type="number"
                        step="0.01"
                        {...register(`modalidades.${idx}.precio`, { valueAsNumber: true })}
                        placeholder="0.00"
                        className={`w-full pl-7 pr-3 py-2 rounded-lg border text-sm outline-none bg-white text-navy
                          ${errors.modalidades?.[idx]?.precio ? 'border-red-400' : 'border-gray-200 focus:border-orange'}`}
                      />
                    </div>
                    {errors.modalidades?.[idx]?.precio && (
                      <p className="text-xs text-red-500 mt-0.5">{errors.modalidades[idx]?.precio?.message}</p>
                    )}
                  </div>
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(idx)}
                      className="mt-2 text-red-400 hover:text-red-600 transition-colors">
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-navy">Descripción</label>
            <textarea {...register('descripcion')} rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-orange text-sm outline-none bg-white text-navy resize-none" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-navy">Estado</label>
            <select {...register('estado')}
              className={`w-full px-3 py-2 rounded-lg border text-sm outline-none bg-white text-navy
                ${errors.estado ? 'border-red-400' : 'border-gray-200 focus:border-orange'}`}>
              <option value="">Seleccionar...</option>
              {['Activo', 'Borrador', 'Descontinuado'].map((e) => <option key={e}>{e}</option>)}
            </select>
            {errors.estado && <p className="text-xs text-red-500">{errors.estado.message}</p>}
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
        title="Eliminar producto"
        message={`¿Seguro que deseas eliminar "${deleteTarget?.nombre}"? Esta acción no se puede deshacer.`}
      />
    </>
  );
}

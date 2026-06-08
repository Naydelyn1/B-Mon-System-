type BadgeVariant = 'green' | 'yellow' | 'red' | 'gray';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const statusMap: Record<string, BadgeVariant> = {
  Activo: 'green',
  Pagado: 'green',
  Vigente: 'green',
  Pendiente: 'yellow',
  'Pendiente firma': 'yellow',
  Prueba: 'yellow',
  Inactivo: 'red',
  Atrasado: 'red',
  Vencido: 'red',
  Cancelado: 'red',
  Borrador: 'gray',
  Descontinuado: 'gray',
};

const variants: Record<BadgeVariant, string> = {
  green: 'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red: 'bg-red-100 text-red-700',
  gray: 'bg-gray-100 text-gray-600',
};

export function Badge({ label, variant }: BadgeProps) {
  const resolved = variant ?? statusMap[label] ?? 'gray';
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${variants[resolved]}`}>
      {label}
    </span>
  );
}

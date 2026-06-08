import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { Producto } from '../../productos/entities/producto.entity';
import { ProductoModalidad } from '../../productos/entities/producto-modalidad.entity';
import { User } from '../../users/entities/user.entity';

export enum EstadoContrato {
  VIGENTE = 'Vigente',
  PENDIENTE_FIRMA = 'Pendiente firma',
  VENCIDO = 'Vencido',
  CANCELADO = 'Cancelado',
}

export enum PeriodicidadContrato {
  MENSUAL = 'Mensual',
  ANUAL = 'Anual',
}

export enum FacturacionContrato {
  PAGO_UNICO = 'Pago único',
  CUOTAS_MENSUALES = 'Cuotas mensuales',
}

@Entity('contratos')
export class Contrato {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  numero: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (v: number) => v,
      from: (v: string) => parseFloat(v),
    },
  })
  montoTotal: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    transformer: {
      to: (v: number) => v,
      from: (v: string) => parseFloat(v),
    },
  })
  descuento: number;

  @Column({ type: 'date' })
  fechaInicio: string;

  @Column({ type: 'date' })
  fechaVencimiento: string;

  @Column({ type: 'enum', enum: EstadoContrato, default: EstadoContrato.PENDIENTE_FIRMA })
  estado: EstadoContrato;

  @Column({ type: 'enum', enum: PeriodicidadContrato, default: PeriodicidadContrato.MENSUAL })
  periodicidad: PeriodicidadContrato;

  @Column({ type: 'enum', enum: FacturacionContrato, default: FacturacionContrato.PAGO_UNICO })
  facturacion: FacturacionContrato;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ type: 'uuid' })
  clienteId: string;

  @ManyToOne(() => Cliente, { nullable: false, eager: false })
  @JoinColumn({ name: 'clienteId' })
  cliente: Cliente;

  @Column({ type: 'uuid' })
  productoId: string;

  @ManyToOne(() => Producto, { nullable: false, eager: false })
  @JoinColumn({ name: 'productoId' })
  producto: Producto;

  @Column({ type: 'uuid', nullable: true })
  modalidadId: string | null;

  @ManyToOne(() => ProductoModalidad, { nullable: true, eager: false })
  @JoinColumn({ name: 'modalidadId' })
  modalidad: ProductoModalidad | null;

  @Column({ type: 'uuid', nullable: true })
  creadoPorId: string | null;

  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'creadoPorId' })
  creadoPor: User | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

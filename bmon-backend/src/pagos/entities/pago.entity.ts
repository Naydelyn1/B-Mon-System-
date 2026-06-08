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
import { Contrato } from '../../contratos/entities/contrato.entity';

export enum EstadoPago {
  PAGADO = 'Pagado',
  PENDIENTE = 'Pendiente',
  ATRASADO = 'Atrasado',
}

export enum MetodoPago {
  TRANSFERENCIA = 'Transferencia',
  EFECTIVO = 'Efectivo',
  YAPE = 'Yape',
  PLIN = 'Plin',
  OTRO = 'Otro',
}

@Entity('pagos')
export class Pago {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (v: number) => v,
      from: (v: string) => parseFloat(v),
    },
  })
  monto: number;

  @Column()
  concepto: string;

  @Column({ type: 'date', nullable: true })
  fecha: string | null;

  @Column({ type: 'enum', enum: EstadoPago, default: EstadoPago.PENDIENTE })
  estado: EstadoPago;

  @Column({ type: 'enum', enum: MetodoPago, nullable: true })
  metodoPago: MetodoPago | null;

  @Column({ type: 'varchar', nullable: true })
  comprobante: string | null;

  @Column({ type: 'text', nullable: true })
  notas: string | null;

  @Column({ type: 'int', nullable: true })
  cuotaNumero: number | null;

  @Column({ type: 'int', nullable: true })
  cuotaTotal: number | null;

  @Column({ type: 'date', nullable: true })
  fechaVencimiento: string | null;

  @Column({ type: 'uuid' })
  clienteId: string;

  @ManyToOne(() => Cliente, { nullable: false, eager: false })
  @JoinColumn({ name: 'clienteId' })
  cliente: Cliente;

  @Column({ type: 'uuid', nullable: true })
  contratoId: string | null;

  @ManyToOne(() => Contrato, { nullable: true, eager: false })
  @JoinColumn({ name: 'contratoId' })
  contrato: Contrato | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

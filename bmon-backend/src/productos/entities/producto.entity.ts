import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductoModalidad } from './producto-modalidad.entity';

export enum EstadoProducto {
  ACTIVO = 'Activo',
  BORRADOR = 'Borrador',
  DESCONTINUADO = 'Descontinuado',
}

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ type: 'enum', enum: EstadoProducto, default: EstadoProducto.ACTIVO })
  estado: EstadoProducto;

  @Column({ type: 'varchar', nullable: true })
  imagenUrl: string | null;

  @OneToMany(() => ProductoModalidad, (m) => m.producto, { cascade: true, eager: false })
  modalidades: ProductoModalidad[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}

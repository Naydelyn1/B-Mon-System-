import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Producto } from '../../productos/entities/producto.entity';

export enum EstadoCliente {
  ACTIVO = 'Activo',
  INACTIVO = 'Inactivo',
  PRUEBA = 'Prueba',
}

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column({ type: 'varchar', nullable: true })
  empresa: string | null;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  telefono: string | null;

  @Column({ type: 'enum', enum: EstadoCliente, default: EstadoCliente.ACTIVO })
  estado: EstadoCliente;

  @Column({ type: 'text', nullable: true })
  notas: string | null;

  @ManyToMany(() => Producto, { eager: false })
  @JoinTable({
    name: 'cliente_sistemas',
    joinColumn: { name: 'clienteId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'productoId', referencedColumnName: 'id' },
  })
  sistemas: Producto[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}

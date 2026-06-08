import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { Pago, EstadoPago } from '../pagos/entities/pago.entity';
import { Cliente, EstadoCliente } from '../clientes/entities/cliente.entity';
import { Producto, EstadoProducto } from '../productos/entities/producto.entity';
import { Contrato, EstadoContrato } from '../contratos/entities/contrato.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(Contrato)
    private readonly contratoRepository: Repository<Contrato>,
  ) {}

  async getResumen() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const [
      ingresosMesRaw,
      clientesActivos,
      productosActivos,
      pagosPendientes,
      contratosVigentes,
      ultimosClientes,
      ultimosPagos,
    ] = await Promise.all([
      this.pagoRepository
        .createQueryBuilder('pago')
        .select('COALESCE(SUM(pago.monto), 0)', 'total')
        .where('pago.estado = :estado', { estado: EstadoPago.PAGADO })
        .andWhere('pago.fecha IS NOT NULL')
        .andWhere('EXTRACT(YEAR FROM pago.fecha) = :year', { year })
        .andWhere('EXTRACT(MONTH FROM pago.fecha) = :month', { month })
        .getRawOne<{ total: string }>(),

      this.clienteRepository.count({ where: { estado: EstadoCliente.ACTIVO } }),

      this.productoRepository.count({ where: { estado: EstadoProducto.ACTIVO } }),

      this.pagoRepository.count({
        where: { estado: In([EstadoPago.PENDIENTE, EstadoPago.ATRASADO]) },
      }),

      this.contratoRepository.count({ where: { estado: EstadoContrato.VIGENTE } }),

      this.clienteRepository.find({
        order: { createdAt: 'DESC' },
        take: 5,
        select: {
          id: true,
          nombre: true,
          empresa: true,
          email: true,
          estado: true,
          createdAt: true,
        },
      }),

      this.pagoRepository.find({
        order: { createdAt: 'DESC' },
        take: 5,
        relations: { cliente: true },
        select: {
          id: true,
          monto: true,
          concepto: true,
          fecha: true,
          estado: true,
          clienteId: true,
          createdAt: true,
          cliente: { id: true, nombre: true },
        },
      }),
    ]);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const en15dias = new Date(hoy);
    en15dias.setDate(en15dias.getDate() + 15);

    const contratosPorVencer = await this.contratoRepository.find({
      where: {
        estado: EstadoContrato.VIGENTE,
        fechaVencimiento: Between(
          hoy.toISOString().slice(0, 10),
          en15dias.toISOString().slice(0, 10),
        ),
      },
      relations: { cliente: true, producto: true },
      select: {
        id: true,
        numero: true,
        fechaVencimiento: true,
        cliente: { id: true, nombre: true },
        producto: { id: true, nombre: true },
      },
      order: { fechaVencimiento: 'ASC' },
    });

    return {
      ingresosMes: parseFloat(ingresosMesRaw?.total ?? '0'),
      clientesActivos,
      productosActivos,
      pagosPendientes,
      contratosVigentes,
      ultimosClientes,
      ultimosPagos,
      contratosPorVencer,
    };
  }

  async getStatsPublicos() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const [ingresosMesRaw, clientesActivos, pagosPendientes, ultimosClientes] = await Promise.all([
      this.pagoRepository
        .createQueryBuilder('pago')
        .select('COALESCE(SUM(pago.monto), 0)', 'total')
        .where('pago.estado = :estado', { estado: EstadoPago.PAGADO })
        .andWhere('pago.fecha IS NOT NULL')
        .andWhere('EXTRACT(YEAR FROM pago.fecha) = :year', { year })
        .andWhere('EXTRACT(MONTH FROM pago.fecha) = :month', { month })
        .getRawOne<{ total: string }>(),

      this.clienteRepository.count({ where: { estado: EstadoCliente.ACTIVO } }),

      this.pagoRepository.count({
        where: { estado: In([EstadoPago.PENDIENTE, EstadoPago.ATRASADO]) },
      }),

      this.clienteRepository.find({
        order: { createdAt: 'DESC' },
        take: 3,
        select: { id: true, nombre: true, estado: true },
      }),
    ]);

    return {
      ingresosMes: parseFloat(ingresosMesRaw?.total ?? '0'),
      clientesActivos,
      pagosPendientes,
      ultimosClientes,
    };
  }
}

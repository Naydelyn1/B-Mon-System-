import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsSelect, FindOptionsWhere, Repository } from 'typeorm';
import { EstadoPago, Pago } from './entities/pago.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';

interface FindAllQuery {
  estado?: EstadoPago;
  clienteId?: string;
}

export interface Resumen {
  totalPagado: number;
  totalPendiente: number;
  totalAtrasado: number;
  cantidadPagos: number;
}

const PAGO_SELECT: FindOptionsSelect<Pago> = {
  id: true,
  monto: true,
  concepto: true,
  fecha: true,
  fechaVencimiento: true,
  cuotaNumero: true,
  cuotaTotal: true,
  estado: true,
  metodoPago: true,
  comprobante: true,
  notas: true,
  clienteId: true,
  contratoId: true,
  createdAt: true,
  updatedAt: true,
  cliente: { id: true, nombre: true, empresa: true },
};

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  findAll(query: FindAllQuery = {}): Promise<Pago[]> {
    const where: FindOptionsWhere<Pago> = {};
    if (query.estado) where.estado = query.estado;
    if (query.clienteId) where.clienteId = query.clienteId;

    return this.pagoRepository.find({
      where,
      relations: { cliente: true },
      select: PAGO_SELECT,
      order: { fechaVencimiento: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Pago> {
    const pago = await this.pagoRepository.findOne({
      where: { id },
      relations: { cliente: true },
      select: PAGO_SELECT,
    });
    if (!pago) {
      throw new NotFoundException(`Pago con id ${id} no encontrado`);
    }
    return pago;
  }

  async create(dto: CreatePagoDto): Promise<Pago> {
    await this.validateCliente(dto.clienteId);
    const pago = this.pagoRepository.create(dto);
    const saved = await this.pagoRepository.save(pago);
    return this.findOne(saved.id);
  }

  async update(id: string, dto: UpdatePagoDto): Promise<Pago> {
    const existing = await this.pagoRepository.findOne({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Pago con id ${id} no encontrado`);
    }
    if (dto.clienteId) {
      await this.validateCliente(dto.clienteId);
    }
    await this.pagoRepository.save({ ...existing, ...dto });
    return this.findOne(id);
  }

  async marcarPagado(id: string): Promise<Pago> {
    const pago = await this.pagoRepository.findOne({ where: { id } });
    if (!pago) {
      throw new NotFoundException(`Pago con id ${id} no encontrado`);
    }
    pago.estado = EstadoPago.PAGADO;
    if (!pago.fecha) {
      pago.fecha = new Date().toISOString().split('T')[0];
    }
    await this.pagoRepository.save(pago);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.pagoRepository.findOne({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Pago con id ${id} no encontrado`);
    }
    if (existing.contratoId) {
      throw new BadRequestException(
        'Este pago está vinculado a un contrato. Elimina el contrato para eliminarlo.',
      );
    }
    await this.pagoRepository.delete(id);
  }

  async getResumen(): Promise<Resumen> {
    const raw = await this.pagoRepository
      .createQueryBuilder('pago')
      .select(
        'COALESCE(SUM(CASE WHEN pago.estado = :pagado THEN pago.monto ELSE 0 END), 0)',
        'totalPagado',
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN pago.estado = :pendiente THEN pago.monto ELSE 0 END), 0)',
        'totalPendiente',
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN pago.estado = :atrasado THEN pago.monto ELSE 0 END), 0)',
        'totalAtrasado',
      )
      .addSelect('COUNT(pago.id)', 'cantidadPagos')
      .setParameters({
        pagado: EstadoPago.PAGADO,
        pendiente: EstadoPago.PENDIENTE,
        atrasado: EstadoPago.ATRASADO,
      })
      .getRawOne<{
        totalPagado: string;
        totalPendiente: string;
        totalAtrasado: string;
        cantidadPagos: string;
      }>();

    return {
      totalPagado: parseFloat(raw?.totalPagado ?? '0'),
      totalPendiente: parseFloat(raw?.totalPendiente ?? '0'),
      totalAtrasado: parseFloat(raw?.totalAtrasado ?? '0'),
      cantidadPagos: parseInt(raw?.cantidadPagos ?? '0', 10),
    };
  }

  private async validateCliente(clienteId: string): Promise<void> {
    const cliente = await this.clienteRepository.findOne({ where: { id: clienteId } });
    if (!cliente) {
      throw new NotFoundException(`Cliente con id ${clienteId} no encontrado`);
    }
  }
}

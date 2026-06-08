import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsSelect, FindOptionsWhere, Like, Repository } from 'typeorm';
import { Contrato, EstadoContrato, FacturacionContrato } from './entities/contrato.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Producto } from '../productos/entities/producto.entity';
import { ProductoModalidad } from '../productos/entities/producto-modalidad.entity';
import { Pago } from '../pagos/entities/pago.entity';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';

interface FindAllQuery {
  estado?: EstadoContrato;
  clienteId?: string;
}

const CONTRATO_SELECT: FindOptionsSelect<Contrato> = {
  id: true,
  numero: true,
  periodicidad: true,
  facturacion: true,
  montoTotal: true,
  descuento: true,
  fechaInicio: true,
  fechaVencimiento: true,
  estado: true,
  descripcion: true,
  clienteId: true,
  productoId: true,
  modalidadId: true,
  creadoPorId: true,
  createdAt: true,
  updatedAt: true,
  cliente: { id: true, nombre: true, empresa: true },
  producto: { id: true, nombre: true },
  modalidad: { id: true, nombre: true },
};

@Injectable()
export class ContratosService {
  constructor(
    @InjectRepository(Contrato)
    private readonly contratoRepository: Repository<Contrato>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(ProductoModalidad)
    private readonly modalidadRepository: Repository<ProductoModalidad>,
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
  ) {}

  async generateNumero(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `C-${year}-`;

    const last = await this.contratoRepository.findOne({
      where: { numero: Like(`${prefix}%`) },
      order: { numero: 'DESC' },
      select: { numero: true },
    });

    if (!last) return `${prefix}001`;

    const seq = parseInt(last.numero.split('-')[2], 10);
    return `${prefix}${(seq + 1).toString().padStart(3, '0')}`;
  }

  findAll(query: FindAllQuery = {}): Promise<Contrato[]> {
    const where: FindOptionsWhere<Contrato> = {};
    if (query.estado) where.estado = query.estado;
    if (query.clienteId) where.clienteId = query.clienteId;

    return this.contratoRepository.find({
      where,
      relations: { cliente: true, producto: true, modalidad: true },
      select: CONTRATO_SELECT,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Contrato> {
    const contrato = await this.contratoRepository.findOne({
      where: { id },
      relations: { cliente: true, producto: true, modalidad: true },
      select: CONTRATO_SELECT,
    });
    if (!contrato) throw new NotFoundException(`Contrato con id ${id} no encontrado`);
    return contrato;
  }

  async create(dto: CreateContratoDto, userId: string): Promise<Contrato> {
    const [, producto] = await Promise.all([
      this.validateCliente(dto.clienteId),
      this.validateProducto(dto.productoId),
    ]);

    if (dto.modalidadId) await this.validateModalidad(dto.modalidadId, dto.productoId);

    const numero = await this.generateNumero();
    const contrato = this.contratoRepository.create({ ...dto, numero, creadoPorId: userId });
    const saved = await this.contratoRepository.save(contrato);

    const modalidadNombre = dto.modalidadId
      ? (await this.modalidadRepository.findOne({ where: { id: dto.modalidadId } }))?.nombre ?? ''
      : '';

    const esCuotasMensuales =
      saved.facturacion === FacturacionContrato.CUOTAS_MENSUALES &&
      saved.periodicidad === 'Anual';

    if (esCuotasMensuales) {
      await this.generarCuotasMensuales(saved, producto, modalidadNombre);
    } else {
      await this.generarPagoUnico(saved, producto, modalidadNombre);
    }

    return this.findOne(saved.id);
  }

  private async generarPagoUnico(
    contrato: Contrato,
    producto: Producto,
    modalidadNombre: string,
  ): Promise<void> {
    const mes = new Date(contrato.fechaInicio).toLocaleString('es-PE', { month: 'long', year: 'numeric' });
    const concepto = modalidadNombre
      ? `${producto.nombre} · ${modalidadNombre} · ${contrato.periodicidad} (${mes})`
      : `${producto.nombre} · ${contrato.periodicidad} (${mes})`;

    await this.pagoRepository.save(
      this.pagoRepository.create({
        monto: contrato.montoTotal,
        concepto,
        fecha: contrato.fechaInicio,
        fechaVencimiento: contrato.fechaVencimiento,
        clienteId: contrato.clienteId,
        contratoId: contrato.id,
      }),
    );
  }

  private async generarCuotasMensuales(
    contrato: Contrato,
    producto: Producto,
    modalidadNombre: string,
  ): Promise<void> {
    const montoCuota = Math.round((contrato.montoTotal / 12) * 100) / 100;
    const pagos: Partial<Pago>[] = [];

    for (let i = 0; i < 12; i++) {
      const fechaCuota = new Date(contrato.fechaInicio);
      fechaCuota.setMonth(fechaCuota.getMonth() + i);
      const fechaStr = fechaCuota.toISOString().slice(0, 10);
      const mes = fechaCuota.toLocaleString('es-PE', { month: 'long', year: 'numeric' });

      const concepto = modalidadNombre
        ? `${producto.nombre} · ${modalidadNombre} · Cuota ${i + 1}/12 (${mes})`
        : `${producto.nombre} · Cuota ${i + 1}/12 (${mes})`;

      pagos.push({
        monto: montoCuota,
        concepto,
        fecha: null,
        fechaVencimiento: fechaStr,
        cuotaNumero: i + 1,
        cuotaTotal: 12,
        clienteId: contrato.clienteId,
        contratoId: contrato.id,
      });
    }

    await this.pagoRepository.save(pagos.map((p) => this.pagoRepository.create(p)));
  }

  async update(id: string, dto: UpdateContratoDto): Promise<Contrato> {
    const existing = await this.contratoRepository.findOne({ where: { id } });
    if (!existing) throw new NotFoundException(`Contrato con id ${id} no encontrado`);
    if (dto.clienteId) await this.validateCliente(dto.clienteId);
    if (dto.productoId) await this.validateProducto(dto.productoId);
    if (dto.modalidadId) {
      await this.validateModalidad(dto.modalidadId, dto.productoId ?? existing.productoId);
    }

    await this.contratoRepository.save({ ...existing, ...dto });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.contratoRepository.findOne({ where: { id } });
    if (!existing) throw new NotFoundException(`Contrato con id ${id} no encontrado`);
    await this.pagoRepository.delete({ contratoId: id });
    await this.contratoRepository.delete(id);
  }

  private async validateCliente(clienteId: string): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({ where: { id: clienteId } });
    if (!cliente) throw new NotFoundException(`Cliente con id ${clienteId} no encontrado`);
    return cliente;
  }

  private async validateProducto(productoId: string): Promise<Producto> {
    const producto = await this.productoRepository.findOne({ where: { id: productoId } });
    if (!producto) throw new NotFoundException(`Producto con id ${productoId} no encontrado`);
    return producto;
  }

  private async validateModalidad(modalidadId: string, productoId: string): Promise<ProductoModalidad> {
    const modalidad = await this.modalidadRepository.findOne({ where: { id: modalidadId, productoId } });
    if (!modalidad) throw new NotFoundException(`Modalidad con id ${modalidadId} no encontrada para este producto`);
    return modalidad;
  }
}

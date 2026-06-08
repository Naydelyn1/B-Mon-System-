import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, In, Repository } from 'typeorm';
import { Cliente, EstadoCliente } from './entities/cliente.entity';
import { Contrato, EstadoContrato } from '../contratos/entities/contrato.entity';
import { ConfigService } from '@nestjs/config';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { MailService } from '../mail/mail.service';

interface FindAllQuery {
  estado?: EstadoCliente;
  search?: string;
}

const ESTADOS_ACTIVOS: EstadoContrato[] = [EstadoContrato.VIGENTE, EstadoContrato.PENDIENTE_FIRMA];

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    @InjectRepository(Contrato)
    private readonly contratoRepository: Repository<Contrato>,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async consultarDocumento(numero: string): Promise<{ nombre: string; empresa?: string; tipo: 'dni' | 'ruc' }> {
    const token = this.configService.get<string>('RENIEC_TOKEN');
    if (!token) throw new BadRequestException('Servicio de consulta no configurado');

    const esDni = numero.length === 8 && /^\d{8}$/.test(numero);
    const esRuc = numero.length === 11 && /^\d{11}$/.test(numero);
    if (!esDni && !esRuc) throw new BadRequestException('Ingresa un DNI (8 dígitos) o RUC (11 dígitos) válido');

    const endpoint = esDni
      ? `https://api.decolecta.com/v1/reniec/dni?numero=${numero}`
      : `https://api.decolecta.com/v1/reniec/ruc?numero=${numero}`;

    let res: Response;
    try {
      res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
    } catch {
      throw new BadRequestException('No se pudo conectar al servicio de consulta. Intenta de nuevo.');
    }

    if (!res.ok) throw new BadRequestException('No se encontró el documento');

    const data = await res.json() as Record<string, string>;

    if (esDni) {
      const nombre = [data.first_name, data.first_last_name, data.second_last_name]
        .filter(Boolean).join(' ');
      return { nombre, tipo: 'dni' };
    } else {
      return { nombre: data.razon_social ?? data.nombre ?? '', empresa: data.razon_social, tipo: 'ruc' };
    }
  }

  findAll(query: FindAllQuery = {}): Promise<Cliente[]> {
    const base: FindOptionsWhere<Cliente> = {};
    if (query.estado) base.estado = query.estado;

    const where: FindOptionsWhere<Cliente> | FindOptionsWhere<Cliente>[] = query.search
      ? [
          { ...base, nombre: ILike(`%${query.search}%`) },
          { ...base, empresa: ILike(`%${query.search}%`) },
        ]
      : base;

    return this.clienteRepository.find({ where });
  }

  async findOne(id: string): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({ where: { id } });
    if (!cliente) throw new NotFoundException(`Cliente con id ${id} no encontrado`);
    return cliente;
  }

  async create(dto: CreateClienteDto): Promise<Cliente> {
    const eliminado = await this.clienteRepository.findOne({
      where: { email: dto.email },
      withDeleted: true,
    });

    if (eliminado?.deletedAt) {
      eliminado.deletedAt = null;
      Object.assign(eliminado, dto);
      await this.clienteRepository.save(eliminado);
      return this.findOne(eliminado.id);
    }

    if (eliminado) {
      throw new ConflictException(`El email ${dto.email} ya está registrado en otro cliente activo`);
    }

    const cliente = this.clienteRepository.create(dto);
    const saved = await this.clienteRepository.save(cliente);
    void this.mailService.sendWelcome(saved.email, saved.nombre);
    return this.findOne(saved.id);
  }

  async update(id: string, dto: UpdateClienteDto): Promise<Cliente> {
    const existing = await this.clienteRepository.findOne({ where: { id } });
    if (!existing) throw new NotFoundException(`Cliente con id ${id} no encontrado`);
    Object.assign(existing, dto);
    await this.clienteRepository.save(existing);
    return this.findOne(id);
  }

  async toggleEstado(id: string): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({ where: { id } });
    if (!cliente) throw new NotFoundException(`Cliente con id ${id} no encontrado`);

    if (cliente.estado === EstadoCliente.ACTIVO) {
      const activos = await this.contratoRepository.count({
        where: { clienteId: id, estado: In(ESTADOS_ACTIVOS) },
      });
      if (activos > 0) {
        throw new ConflictException(
          `No se puede inactivar: el cliente tiene ${activos} contrato(s) activo(s). Cancélalos primero.`,
        );
      }
      cliente.estado = EstadoCliente.INACTIVO;
    } else {
      cliente.estado = EstadoCliente.ACTIVO;
    }

    await this.clienteRepository.save(cliente);
    return cliente;
  }

  async remove(id: string): Promise<void> {
    const existing = await this.clienteRepository.findOne({ where: { id } });
    if (!existing) throw new NotFoundException(`Cliente con id ${id} no encontrado`);

    const activos = await this.contratoRepository.count({
      where: { clienteId: id, estado: In(ESTADOS_ACTIVOS) },
    });
    if (activos > 0) {
      throw new ConflictException(
        `No se puede eliminar: el cliente tiene ${activos} contrato(s) activo(s). Cancélalos primero.`,
      );
    }

    await this.clienteRepository.softDelete(id);
  }
}

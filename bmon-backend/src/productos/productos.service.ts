import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { EstadoProducto, Producto } from './entities/producto.entity';
import { ProductoModalidad } from './entities/producto-modalidad.entity';
import { CreateProductoDto, ModalidadDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { Contrato, EstadoContrato } from '../contratos/entities/contrato.entity';

interface FindAllQuery {
  estado?: EstadoProducto;
  search?: string;
}

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(ProductoModalidad)
    private readonly modalidadRepository: Repository<ProductoModalidad>,
    @InjectRepository(Contrato)
    private readonly contratoRepository: Repository<Contrato>,
  ) {}

  findAll(query: FindAllQuery = {}): Promise<Producto[]> {
    const where: Record<string, unknown> = {};
    if (query.estado) where.estado = query.estado;
    if (query.search) where.nombre = ILike(`%${query.search}%`);
    return this.productoRepository.find({ where, relations: { modalidades: true } });
  }

  async findOne(id: string): Promise<Producto> {
    const producto = await this.productoRepository.findOne({
      where: { id },
      relations: { modalidades: true },
    });
    if (!producto) throw new NotFoundException(`Producto con id ${id} no encontrado`);
    return producto;
  }

  async create(dto: CreateProductoDto): Promise<Producto> {
    const { modalidades, ...rest } = dto;
    const producto = this.productoRepository.create(rest);
    const saved = await this.productoRepository.save(producto);

    if (modalidades?.length) {
      await this.modalidadRepository.save(
        modalidades.map((m) => this.modalidadRepository.create({ ...m, productoId: saved.id })),
      );
    }

    return this.findOne(saved.id);
  }

  async update(id: string, dto: UpdateProductoDto): Promise<Producto> {
    const producto = await this.findOne(id);
    const { modalidades, ...rest } = dto;
    Object.assign(producto, rest);
    await this.productoRepository.save(producto);

    if (modalidades !== undefined) {
      await this.modalidadRepository.softDelete({ productoId: id });
      if (modalidades.length) {
        await this.modalidadRepository.save(
          modalidades.map((m) => this.modalidadRepository.create({ ...m, productoId: id })),
        );
      }
    }

    return this.findOne(id);
  }

  async updateImagen(id: string, filename: string): Promise<Producto> {
    const producto = await this.findOne(id);
    producto.imagenUrl = `/uploads/productos/${filename}`;
    return this.productoRepository.save(producto);
  }

  async addModalidad(productoId: string, dto: ModalidadDto): Promise<ProductoModalidad> {
    await this.findOne(productoId);
    return this.modalidadRepository.save(
      this.modalidadRepository.create({ ...dto, productoId }),
    );
  }

  async updateModalidad(modalidadId: string, dto: Partial<ModalidadDto>): Promise<ProductoModalidad> {
    const modalidad = await this.modalidadRepository.findOne({ where: { id: modalidadId } });
    if (!modalidad) throw new NotFoundException(`Modalidad con id ${modalidadId} no encontrada`);
    Object.assign(modalidad, dto);
    return this.modalidadRepository.save(modalidad);
  }

  async removeModalidad(modalidadId: string): Promise<void> {
    const modalidad = await this.modalidadRepository.findOne({ where: { id: modalidadId } });
    if (!modalidad) throw new NotFoundException(`Modalidad con id ${modalidadId} no encontrada`);

    const contratosActivos = await this.contratoRepository.count({
      where: {
        modalidadId,
        estado: In([EstadoContrato.VIGENTE, EstadoContrato.PENDIENTE_FIRMA]),
      },
    });
    if (contratosActivos > 0) {
      throw new BadRequestException(
        `No se puede eliminar la modalidad porque tiene ${contratosActivos} contrato(s) activo(s) asociado(s).`,
      );
    }

    await this.modalidadRepository.softDelete(modalidadId);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    const contratosActivos = await this.contratoRepository.count({
      where: {
        productoId: id,
        estado: In([EstadoContrato.VIGENTE, EstadoContrato.PENDIENTE_FIRMA]),
      },
    });
    if (contratosActivos > 0) {
      throw new BadRequestException(
        `No se puede eliminar el producto porque tiene ${contratosActivos} contrato(s) activo(s) asociado(s).`,
      );
    }

    await this.productoRepository.softDelete(id);
  }
}

import { ConflictException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoProducto } from './entities/tipo-producto.entity';
import { CreateTipoProductoDto } from './dto/create-tipo-producto.dto';

const TIPOS_INICIALES = ['SaaS mensual', 'Licencia única', 'A medida'];

@Injectable()
export class TiposProductoService implements OnModuleInit {
  constructor(
    @InjectRepository(TipoProducto)
    private readonly repo: Repository<TipoProducto>,
  ) {}

  async onModuleInit() {
    const count = await this.repo.count();
    if (count === 0) {
      await this.repo.save(TIPOS_INICIALES.map((nombre) => this.repo.create({ nombre })));
    }
  }

  findAll() {
    return this.repo.find({ order: { nombre: 'ASC' } });
  }

  async create(dto: CreateTipoProductoDto) {
    const exists = await this.repo.findOneBy({ nombre: dto.nombre });
    if (exists) throw new ConflictException('Ya existe ese tipo de producto');
    return this.repo.save(this.repo.create(dto));
  }

  remove(id: string) {
    return this.repo.delete(id);
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity';
import { ProductoModalidad } from './entities/producto-modalidad.entity';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { Contrato } from '../contratos/entities/contrato.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Producto, ProductoModalidad, Contrato])],
  providers: [ProductosService],
  controllers: [ProductosController],
  exports: [ProductosService],
})
export class ProductosModule {}

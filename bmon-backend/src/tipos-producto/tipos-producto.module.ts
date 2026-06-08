import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoProducto } from './entities/tipo-producto.entity';
import { TiposProductoService } from './tipos-producto.service';
import { TiposProductoController } from './tipos-producto.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TipoProducto])],
  providers: [TiposProductoService],
  controllers: [TiposProductoController],
})
export class TiposProductoModule {}

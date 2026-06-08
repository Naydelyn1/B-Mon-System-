import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contrato } from './entities/contrato.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Producto } from '../productos/entities/producto.entity';
import { ProductoModalidad } from '../productos/entities/producto-modalidad.entity';
import { Pago } from '../pagos/entities/pago.entity';
import { ContratosService } from './contratos.service';
import { ContratosController } from './contratos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Contrato, Cliente, Producto, ProductoModalidad, Pago])],
  providers: [ContratosService],
  controllers: [ContratosController],
})
export class ContratosModule {}

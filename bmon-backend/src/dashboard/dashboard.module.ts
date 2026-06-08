import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pago } from '../pagos/entities/pago.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Contrato } from '../contratos/entities/contrato.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pago, Cliente, Producto, Contrato])],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}

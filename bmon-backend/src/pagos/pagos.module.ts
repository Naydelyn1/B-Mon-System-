import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pago } from './entities/pago.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { PagosService } from './pagos.service';
import { PagosController } from './pagos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pago, Cliente])],
  providers: [PagosService],
  controllers: [PagosController],
})
export class PagosModule {}

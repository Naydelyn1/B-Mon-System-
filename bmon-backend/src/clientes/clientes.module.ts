import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Cliente } from './entities/cliente.entity';
import { Contrato } from '../contratos/entities/contrato.entity';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cliente, Contrato]), ConfigModule, MailModule],
  providers: [ClientesService],
  controllers: [ClientesController],
})
export class ClientesModule {}

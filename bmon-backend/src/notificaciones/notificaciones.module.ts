import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contrato } from '../contratos/entities/contrato.entity';
import { Pago } from '../pagos/entities/pago.entity';
import { MailModule } from '../mail/mail.module';
import { NotificacionesService } from './notificaciones.service';

@Module({
  imports: [TypeOrmModule.forFeature([Contrato, Pago]), MailModule],
  providers: [NotificacionesService],
})
export class NotificacionesModule {}

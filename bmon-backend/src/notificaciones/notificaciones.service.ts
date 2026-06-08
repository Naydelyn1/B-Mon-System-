import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThanOrEqual, Repository } from 'typeorm';
import { Contrato, EstadoContrato } from '../contratos/entities/contrato.entity';
import { Pago, EstadoPago } from '../pagos/entities/pago.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class NotificacionesService {
  private readonly logger = new Logger(NotificacionesService.name);

  constructor(
    @InjectRepository(Contrato)
    private readonly contratoRepository: Repository<Contrato>,
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
    private readonly mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async enviarAvisosVencimientoContrato() {
    this.logger.log('Revisando contratos próximos a vencer...');

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const en15dias = new Date(hoy);
    en15dias.setDate(en15dias.getDate() + 15);

    const contratos = await this.contratoRepository.find({
      where: {
        estado: EstadoContrato.VIGENTE,
        fechaVencimiento: Between(
          hoy.toISOString().slice(0, 10),
          en15dias.toISOString().slice(0, 10),
        ),
      },
      relations: { cliente: true, producto: true },
    });

    this.logger.log(`Contratos a notificar: ${contratos.length}`);

    for (const contrato of contratos) {
      const diasRestantes = Math.ceil(
        (new Date(contrato.fechaVencimiento).getTime() - hoy.getTime()) / 86400000,
      );

      if (![15, 7, 1].includes(diasRestantes)) continue;

      await this.mailService.sendExpirationWarning(
        contrato.cliente.email,
        contrato.cliente.nombre,
        contrato.producto.nombre,
        contrato.fechaVencimiento,
        diasRestantes,
      );

      this.logger.log(
        `Aviso enviado a ${contrato.cliente.email} — contrato ${contrato.numero} vence en ${diasRestantes} días`,
      );
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async enviarAvisosCuotasPendientes() {
    this.logger.log('Revisando cuotas próximas a vencer...');

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const en3dias = new Date(hoy);
    en3dias.setDate(en3dias.getDate() + 3);

    const cuotas = await this.pagoRepository.find({
      where: {
        estado: EstadoPago.PENDIENTE,
        fechaVencimiento: Between(
          hoy.toISOString().slice(0, 10),
          en3dias.toISOString().slice(0, 10),
        ),
      },
      relations: { cliente: true },
    });

    this.logger.log(`Cuotas próximas a vencer: ${cuotas.length}`);

    for (const cuota of cuotas) {
      await this.mailService.sendPaymentReminder(
        cuota.cliente.email,
        cuota.cliente.nombre,
        cuota.concepto,
        cuota.monto,
        cuota.fechaVencimiento!,
        cuota.cuotaNumero ?? undefined,
        cuota.cuotaTotal ?? undefined,
      );

      this.logger.log(
        `Recordatorio enviado a ${cuota.cliente.email} — ${cuota.concepto}`,
      );
    }

    // Marcar como Atrasado las cuotas vencidas
    const vencidas = await this.pagoRepository.find({
      where: {
        estado: EstadoPago.PENDIENTE,
        fechaVencimiento: LessThanOrEqual(
          new Date(hoy.getTime() - 86400000).toISOString().slice(0, 10),
        ),
      },
    });

    if (vencidas.length > 0) {
      await this.pagoRepository.save(
        vencidas.map((p) => ({ ...p, estado: EstadoPago.ATRASADO })),
      );
      this.logger.log(`Cuotas marcadas como atrasadas: ${vencidas.length}`);
    }
  }
}

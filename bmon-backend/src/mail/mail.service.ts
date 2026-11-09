import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.config.get<string>('MAIL_USER'),
        pass: this.config.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendExpirationWarning(to: string, nombre: string, producto: string, fechaVencimiento: string, diasRestantes: number): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Montufar Systems" <${this.config.get('MAIL_USER')}>`,
        to,
        subject: `Tu suscripción a ${producto} vence en ${diasRestantes} días`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a2236;">
            <div style="background: #f97316; padding: 28px 32px; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #fff; font-size: 22px; letter-spacing: 1px;">Montufar Sys</h1>
            </div>
            <div style="background: #fff; padding: 32px; border: 1px solid #f0ece6; border-top: none; border-radius: 0 0 12px 12px;">
              <h2 style="margin-top: 0; font-size: 20px;">¡Hola, ${nombre}!</h2>
              <p style="line-height: 1.6; color: #444;">
                Te informamos que tu suscripción al sistema <strong>${producto}</strong> vencerá en
                <strong style="color: #f97316;">${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'}</strong>
                (${fechaVencimiento}).
              </p>
              <p style="line-height: 1.6; color: #444;">
                Para evitar interrupciones en el servicio, te recomendamos renovar tu contrato a la brevedad posible.
                Si ya realizaste el pago o tienes alguna consulta, comunícate con nosotros.
              </p>
              <div style="margin-top: 28px; padding: 16px; background: #fff8f5; border-left: 4px solid #f97316; border-radius: 4px;">
                <p style="margin: 0; color: #444; font-size: 14px;">
                  <strong>Sistema:</strong> ${producto}<br/>
                  <strong>Fecha de vencimiento:</strong> ${fechaVencimiento}
                </p>
              </div>
              <p style="margin-top: 32px; color: #888; font-size: 13px;">
                Este es un correo automático, por favor no respondas a este mensaje.
              </p>
            </div>
          </div>
        `,
      });
    } catch (err: any) {
      this.logger.error(`No se pudo enviar aviso de vencimiento a ${to}: ${err?.message}`);
    }
  }

  async sendPaymentReminder(
    to: string,
    nombre: string,
    concepto: string,
    monto: number,
    fechaVencimiento: string,
    cuotaNumero?: number,
    cuotaTotal?: number,
  ): Promise<void> {
    const cuotaInfo = cuotaNumero && cuotaTotal ? ` (Cuota ${cuotaNumero}/${cuotaTotal})` : '';
    try {
      await this.transporter.sendMail({
        from: `"Montufar Systems" <${this.config.get('MAIL_USER')}>`,
        to,
        subject: `Recordatorio de pago${cuotaInfo}: ${concepto}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a2236;">
            <div style="background: #f97316; padding: 28px 32px; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #fff; font-size: 22px; letter-spacing: 1px;">Montufar Sys</h1>
            </div>
            <div style="background: #fff; padding: 32px; border: 1px solid #f0ece6; border-top: none; border-radius: 0 0 12px 12px;">
              <h2 style="margin-top: 0; font-size: 20px;">¡Hola, ${nombre}!</h2>
              <p style="line-height: 1.6; color: #444;">
                Te recordamos que tienes un pago próximo a vencer:
              </p>
              <div style="margin: 20px 0; padding: 16px; background: #fff8f5; border-left: 4px solid #f97316; border-radius: 4px;">
                <p style="margin: 0; color: #444; font-size: 15px;">
                  <strong>Concepto:</strong> ${concepto}${cuotaInfo}<br/>
                  <strong>Monto:</strong> S/ ${monto.toFixed(2)}<br/>
                  <strong>Fecha de vencimiento:</strong> ${fechaVencimiento}
                </p>
              </div>
              <p style="line-height: 1.6; color: #444;">
                Por favor realiza el pago antes de la fecha indicada para evitar recargos o interrupciones en el servicio.
              </p>
              <p style="margin-top: 32px; color: #888; font-size: 13px;">
                Este es un correo automático, por favor no respondas a este mensaje.
              </p>
            </div>
          </div>
        `,
      });
    } catch (err: any) {
      this.logger.error(`No se pudo enviar recordatorio de pago a ${to}: ${err?.message}`);
    }
  }

  /** Lanza el error si falla, para que quien llama lo registre. */
  async sendPasswordReset(to: string, nombre: string, url: string): Promise<void> {
    const esc = (s: string) =>
      s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
    await this.transporter.sendMail({
      from: `"Montufar Systems" <${this.config.get('MAIL_USER')}>`,
      to,
      subject: 'Restablece tu contraseña de Montufar Sys',
      text: `Hola, ${nombre}. Para crear una contraseña nueva abre este enlace (vale 30 minutos y un solo uso): ${url}\nSi no lo pediste, ignora este correo; tu contraseña no cambia.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a2236;">
          <div style="background: #0b1220; padding: 28px 32px; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; color: #fff; font-size: 22px; letter-spacing: 1px;">Montufar Sys</h1>
          </div>
          <div style="background: #fff; padding: 32px; border: 1px solid #f0ece6; border-top: none; border-radius: 0 0 12px 12px;">
            <h2 style="margin-top: 0; font-size: 20px;">Hola, ${esc(nombre)}</h2>
            <p style="line-height: 1.6; color: #444;">
              Recibimos una solicitud para restablecer la contraseña de tu cuenta del panel.
              Pulsa el botón para crear una nueva:
            </p>
            <p style="margin: 28px 0; text-align: center;">
              <a href="${esc(url)}" style="display: inline-block; background: #b4441a; color: #fff; text-decoration: none; font-weight: bold; padding: 14px 28px; border-radius: 10px;">
                Crear contraseña nueva
              </a>
            </p>
            <p style="line-height: 1.6; color: #444; font-size: 14px;">
              El enlace vale <strong>30 minutos</strong> y solo se puede usar una vez.
              Si no pediste este cambio, ignora este correo: tu contraseña sigue siendo la misma.
            </p>
            <p style="margin-top: 32px; color: #888; font-size: 13px;">
              Este es un correo automático, por favor no respondas a este mensaje.
            </p>
          </div>
        </div>
      `,
    });
  }

  async sendWelcome(to: string, nombre: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Montufar Systems" <${this.config.get('MAIL_USER')}>`,
        to,
        subject: '¡Bienvenido a Montufar Systems!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a2236;">
            <div style="background: #f97316; padding: 28px 32px; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #fff; font-size: 22px; letter-spacing: 1px;">Montufar Sys</h1>
            </div>
            <div style="background: #fff; padding: 32px; border: 1px solid #f0ece6; border-top: none; border-radius: 0 0 12px 12px;">
              <h2 style="margin-top: 0; font-size: 20px;">¡Hola, ${nombre}!</h2>
              <p style="line-height: 1.6; color: #444;">
                Te damos la bienvenida a <strong>Montufar Systems</strong>. Tu registro ha sido completado exitosamente.
              </p>
              <p style="line-height: 1.6; color: #444;">
                A partir de ahora podrás acceder a todos los servicios contratados. Si tienes alguna consulta o necesitas soporte, no dudes en contactarnos.
              </p>
              <p style="margin-top: 32px; color: #888; font-size: 13px;">
                Este es un correo automático, por favor no respondas a este mensaje.
              </p>
            </div>
          </div>
        `,
      });
    } catch (err: any) {
      this.logger.error(`No se pudo enviar correo de bienvenida a ${to}: ${err?.message}`);
    }
  }
}

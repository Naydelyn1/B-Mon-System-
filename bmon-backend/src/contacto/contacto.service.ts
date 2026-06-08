import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { ContactoDto } from './contacto.dto';

@Injectable()
export class ContactoService {
  private readonly logger = new Logger(ContactoService.name);
  constructor(private readonly configService: ConfigService) {}

  async enviarMensaje(dto: ContactoDto): Promise<void> {
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASS');

    if (!user || !pass) {
      throw new InternalServerErrorException('Servicio de correo no configurado');
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });

    try {
      await transporter.sendMail({
        from: `"B-Mon System" <${user}>`,
        to: this.configService.get<string>('MAIL_TO') ?? user,
        replyTo: dto.email,
        subject: `[Contacto Web] ${dto.asunto}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#1a2035">Nuevo mensaje de contacto</h2>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px;color:#666;width:120px">Nombre:</td><td style="padding:8px;font-weight:600">${dto.nombre}</td></tr>
              <tr><td style="padding:8px;color:#666">Email:</td><td style="padding:8px">${dto.email}</td></tr>
              <tr><td style="padding:8px;color:#666">Asunto:</td><td style="padding:8px">${dto.asunto}</td></tr>
            </table>
            <div style="background:#f5ead8;border-radius:8px;padding:16px;margin-top:16px">
              <p style="margin:0;color:#1a2035">${dto.mensaje.replace(/\n/g, '<br>')}</p>
            </div>
            <p style="color:#999;font-size:12px;margin-top:24px">Enviado desde bmondev.com</p>
          </div>
        `,
      });
    } catch (err) {
      this.logger.error('Error al enviar email:', err);
      throw new InternalServerErrorException('Error al enviar el correo');
    }
  }
}

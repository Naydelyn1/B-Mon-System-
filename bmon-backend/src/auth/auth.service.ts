import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { isUUID } from 'class-validator';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { MailService } from '../mail/mail.service';

/** Tiempo mínimo entre dos correos de recuperación al mismo email. */
const RESET_COOLDOWN_MS = 60_000;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly lastResetRequest = new Map<string, number>();

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _pw, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: Omit<User, 'password'>) {
    const payload = { sub: user.id, email: user.email, rol: user.rol, nombre: user.nombre };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  // --- Recuperación de contraseña ---
  // El enlace lleva un JWT firmado con JWT_SECRET + el hash actual de la contraseña:
  // en cuanto la contraseña cambia, el enlace deja de valer (un solo uso) y no hace
  // falta guardar tokens en la base de datos. Caduca a los 30 minutos.

  private resetSecret(passwordHash: string): string {
    return `${this.config.getOrThrow<string>('JWT_SECRET')}:reset:${passwordHash}`;
  }

  /** Envía el enlace si el email existe. No revela si existe o no. */
  async requestPasswordReset(email: string): Promise<void> {
    const key = email.trim().toLowerCase();
    const now = Date.now();
    if (now - (this.lastResetRequest.get(key) ?? 0) < RESET_COOLDOWN_MS) return;
    this.lastResetRequest.set(key, now);
    if (this.lastResetRequest.size > 1000) {
      for (const [k, t] of this.lastResetRequest) if (now - t > RESET_COOLDOWN_MS) this.lastResetRequest.delete(k);
    }

    const user = await this.usersService.findByEmail(email.trim());
    if (!user) return;

    const token = this.jwtService.sign(
      { sub: user.id, purpose: 'reset' },
      { secret: this.resetSecret(user.password), expiresIn: '30m' },
    );
    const base = (this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000').replace(/\/+$/, '');
    // El token va en el fragmento (#): el navegador no lo envía al servidor ni en el Referer.
    const url = `${base}/restablecer#token=${token}`;

    // Sin await: la respuesta tarda lo mismo exista o no el email.
    this.mailService.sendPasswordReset(user.email, user.nombre, url).catch((err: Error) => {
      this.logger.error(`No se pudo enviar el enlace de recuperación: ${err.message}`);
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const invalid = new BadRequestException('El enlace no es válido o ya expiró. Solicita uno nuevo.');

    const decoded = this.jwtService.decode<{ sub?: string; purpose?: string } | null>(token);
    if (!decoded || decoded.purpose !== 'reset' || !decoded.sub || !isUUID(decoded.sub)) throw invalid;

    const user = await this.usersService.findByIdWithPassword(decoded.sub);
    if (!user) throw invalid;

    try {
      this.jwtService.verify(token, { secret: this.resetSecret(user.password) });
    } catch {
      throw invalid;
    }

    await this.usersService.updatePassword(user.id, newPassword);
  }
}

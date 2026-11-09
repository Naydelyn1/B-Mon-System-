import { Body, Controller, ForbiddenException, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { UserRol } from '../users/entities/user.entity';

type JwtUser = { id: string; email: string; rol: string; nombre: string };
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-reset.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@CurrentUser() user: any, @Body() _dto: LoginDto) {
    return this.authService.login(user);
  }

  @HttpCode(200)
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.requestPasswordReset(dto.email);
    return {
      message: 'Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.',
    };
  }

  @HttpCode(200)
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.password);
    return { message: 'Tu contraseña se actualizó. Ya puedes iniciar sesión.' };
  }

  // Solo un admin con sesión iniciada puede crear usuarios.
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('register')
  async register(@CurrentUser() current: JwtUser, @Body() dto: CreateUserDto) {
    if (current?.rol !== UserRol.ADMIN) {
      throw new ForbiddenException('Solo un administrador puede crear usuarios');
    }
    const { password: _hash, ...user } = await this.usersService.create(dto);
    return user;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@CurrentUser() user: unknown) {
    return user;
  }
}

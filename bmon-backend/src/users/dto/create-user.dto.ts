import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRol } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(UserRol)
  @IsOptional()
  rol?: UserRol;
}

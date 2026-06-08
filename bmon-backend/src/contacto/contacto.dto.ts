import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ContactoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  asunto: string;

  @IsString()
  @MinLength(1)
  mensaje: string;
}

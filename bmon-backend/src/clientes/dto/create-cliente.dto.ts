import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { EstadoCliente } from '../entities/cliente.entity';

export class CreateClienteDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsOptional()
  empresa?: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsEnum(EstadoCliente)
  @IsOptional()
  estado?: EstadoCliente;

  @IsString()
  @IsOptional()
  notas?: string;
}

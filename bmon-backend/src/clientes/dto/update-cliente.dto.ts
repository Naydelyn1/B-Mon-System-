import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { EstadoCliente } from '../entities/cliente.entity';

export class UpdateClienteDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  empresa?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

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

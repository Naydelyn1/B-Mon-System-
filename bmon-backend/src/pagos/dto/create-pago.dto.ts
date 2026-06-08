import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { EstadoPago, MetodoPago } from '../entities/pago.entity';

export class CreatePagoDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  monto: number;

  @IsString()
  @IsNotEmpty()
  concepto: string;

  @IsDateString()
  @IsOptional()
  fecha?: string;

  @IsEnum(EstadoPago)
  @IsOptional()
  estado?: EstadoPago;

  @IsEnum(MetodoPago)
  @IsOptional()
  metodoPago?: MetodoPago;

  @IsString()
  @IsOptional()
  comprobante?: string;

  @IsString()
  @IsOptional()
  notas?: string;

  @IsUUID()
  clienteId: string;
}

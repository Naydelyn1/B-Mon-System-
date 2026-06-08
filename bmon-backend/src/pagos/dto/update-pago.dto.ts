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

export class UpdatePagoDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  monto?: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  concepto?: string;

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
  @IsOptional()
  clienteId?: string;
}

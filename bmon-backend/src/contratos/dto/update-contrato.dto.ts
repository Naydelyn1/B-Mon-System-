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
import { EstadoContrato, FacturacionContrato } from '../entities/contrato.entity';

export class UpdateContratoDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  montoTotal?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  descuento?: number;

  @IsDateString()
  @IsOptional()
  fechaInicio?: string;

  @IsDateString()
  @IsOptional()
  fechaVencimiento?: string;

  @IsEnum(EstadoContrato)
  @IsOptional()
  estado?: EstadoContrato;

  @IsEnum(FacturacionContrato)
  @IsOptional()
  facturacion?: FacturacionContrato;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  descripcion?: string;

  @IsUUID()
  @IsOptional()
  clienteId?: string;

  @IsUUID()
  @IsOptional()
  productoId?: string;

  @IsUUID()
  @IsOptional()
  modalidadId?: string;
}

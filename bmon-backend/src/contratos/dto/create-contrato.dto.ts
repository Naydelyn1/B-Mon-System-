import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { EstadoContrato, FacturacionContrato, PeriodicidadContrato } from '../entities/contrato.entity';

export class CreateContratoDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  montoTotal!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  descuento?: number;

  @IsDateString()
  fechaInicio!: string;

  @IsDateString()
  fechaVencimiento!: string;

  @IsEnum(PeriodicidadContrato)
  @IsOptional()
  periodicidad?: PeriodicidadContrato;

  @IsEnum(EstadoContrato)
  @IsOptional()
  estado?: EstadoContrato;

  @IsEnum(FacturacionContrato)
  @IsOptional()
  facturacion?: FacturacionContrato;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsUUID()
  clienteId!: string;

  @IsUUID()
  productoId!: string;

  @IsUUID()
  @IsOptional()
  modalidadId?: string;
}

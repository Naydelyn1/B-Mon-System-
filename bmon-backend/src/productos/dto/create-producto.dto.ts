import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoProducto } from '../entities/producto.entity';

export class ModalidadDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @IsNumber()
  @Min(0)
  precio!: number;
}

export class CreateProductoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsEnum(EstadoProducto)
  @IsOptional()
  estado?: EstadoProducto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModalidadDto)
  @IsOptional()
  modalidades?: ModalidadDto[];
}

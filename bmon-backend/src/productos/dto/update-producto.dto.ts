import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoProducto } from '../entities/producto.entity';
import { ModalidadDto } from './create-producto.dto';

export class UpdateProductoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @IsOptional()
  nombre?: string;

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

import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTipoProductoDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  nombre: string;
}

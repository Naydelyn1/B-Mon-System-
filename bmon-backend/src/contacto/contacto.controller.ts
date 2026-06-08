import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ContactoService } from './contacto.service';
import { ContactoDto } from './contacto.dto';

@ApiTags('Contacto')
@Controller('contacto')
export class ContactoController {
  constructor(private readonly contactoService: ContactoService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async enviar(@Body() dto: ContactoDto) {
    await this.contactoService.enviarMensaje(dto);
    return { message: 'Mensaje enviado correctamente' };
  }
}

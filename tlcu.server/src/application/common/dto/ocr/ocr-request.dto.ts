import { ApiProperty } from '@nestjs/swagger';

export class OcrRequestDto {

  @ApiProperty({
    description: 'bytes de la imagen',
    type: 'string',
    format: 'binary',
  })
  imageBuffer: Buffer;

  @ApiProperty({
    description: 'idioma, spa por defecto',
    type: 'string',
  })
  language?: string;
 
}
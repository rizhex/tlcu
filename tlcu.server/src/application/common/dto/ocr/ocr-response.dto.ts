import { ApiProperty } from '@nestjs/swagger';

export class OcrResponse {
 
  @ApiProperty({
    description: 'Texto del ocr',
    default: "",
  })
  text: string;
  
}
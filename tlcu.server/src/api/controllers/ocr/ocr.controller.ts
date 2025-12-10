import { Controller, Post, Body, HttpCode, HttpStatus, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OcrService } from 'src/application/services/ocr/ocr.service';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OcrRequestDto } from 'src/application/common/dto/ocr/ocr-request.dto';
import { OcrResponse } from 'src/application/common/dto/ocr/ocr-response.dto';
import { request } from 'http';




@ApiTags('OCR')
@Controller('ocr')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}


  @Post('process-buffer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Procesar imagen desde buffer', description: 'Extrae texto de una imagen enviada como buffer en base64' })
  @ApiResponse({ status: 200, description: 'Texto extraído exitosamente', type: OcrRequestDto })
  @ApiResponse({ status: 400, description: 'Error en la solicitud' })
  @ApiBody({
    description: 'Imagen en formato buffer',
    type: OcrRequestDto
  })
  async processImageFromBuffer(
    @Body() body: OcrRequestDto
  ): Promise<OcrResponse> {

     console.log('=== OCR Request Debug ===');
    console.log('Request body type:', typeof body);
    console.log('Request body:', body);
    console.log('Body keys:', body ? Object.keys(body) : 'Body is null/undefined');
    console.log('======================');
    
    if (!body || !body.imageBuffer) {
        throw new Error('imageBuffer is required. Received: ' + JSON.stringify(body));
    }
    let imageBuffer: Buffer;
    if (typeof body.imageBuffer === 'string') {
      imageBuffer = Buffer.from(body.imageBuffer, 'base64');
    } else {
      imageBuffer = body.imageBuffer as any;
    }

    const text = await this.ocrService.processImageOcr(imageBuffer, body.language);
    return { text };
  }

}
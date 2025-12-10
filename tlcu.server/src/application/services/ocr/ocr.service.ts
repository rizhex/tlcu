import { Injectable, BadRequestException } from '@nestjs/common';
import * as Tesseract from 'tesseract.js'; 


@Injectable()
export class OcrService {

  async processImageOcr(imageBuffer: Buffer, language: string = 'spa'): Promise<string> {
    if (!imageBuffer || imageBuffer.length === 0) {
      throw new BadRequestException('Buffer de imagen válido es requerido.');
    }

    try {
      console.log('Iniciando reconocimiento OCR...');

      const { data } = await Tesseract.recognize(imageBuffer, language, {
        logger: m => console.log(m)
      });

      console.log( data.text.trim());
      return data.text.trim();

    } catch (error) {
      console.error('Error en procesamiento OCR:', error);
      throw new BadRequestException(`Error al procesar el OCR: ${error.message}`);
    }
  }
}
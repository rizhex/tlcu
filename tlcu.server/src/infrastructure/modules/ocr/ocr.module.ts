import { Module } from '@nestjs/common';
import { OcrService } from 'src/application/services/ocr/ocr.service';
import { OcrController } from 'src/api/controllers/ocr/ocr.controller';

@Module({

    imports:[],
    providers:[OcrService],
    controllers:[OcrController]
})
export class OcrModule {}

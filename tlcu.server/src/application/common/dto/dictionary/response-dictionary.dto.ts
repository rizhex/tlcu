
// create-dictionary.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUrl, IsDate, IsDateString, IsNumber } from 'class-validator';

export class ResponseDictionaryDto {

  @ApiProperty({
    description: 'Id, solo para respuestas, no rellenar',
    required: true
  })
  @IsNumber()
  @IsOptional()
  id: number



  @ApiProperty({
    description: 'Nombre corto del diccionario',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Título formal del diccionario'
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Título completo con edición'
  })
  @IsString()
  @IsNotEmpty()
  fullTitle: string;

  @ApiProperty({
    description: 'Autor o institución responsable'
  })
   @IsString()
  @IsOptional()
  author: string;

  @ApiProperty({
    description: 'Fecha original de publicación (formato YYYY-MM-DD)',
  })
   @IsDateString()
  @IsOptional()
  originalDate: string;

  @ApiProperty({
    description: 'Siglo de creación',
  })
   @IsString()
  @IsOptional()
  century: string;

  @ApiProperty({
    description: 'Lugar de publicacion',
  })
   @IsString()
  @IsOptional()
  publishingPlace: string;

  @ApiProperty({
    description: 'Publicador',
  })
   @IsString()
  @IsOptional()
  publisher: string;

  @ApiProperty({
    description: 'Fecha de publicacion'
  })
   @IsDateString()
  @IsOptional()
  publishingDate: string;

  @ApiProperty({
    description: 'Edicion'
  })
   @IsString()
  @IsOptional()
  edition: string;

   @ApiProperty({
    description: 'Nombre de fuente'
  })
   @IsString()
  @IsOptional()
  sourceName: string;



  @ApiProperty({
    description: 'Apuntes'
  })
   @IsString()
  @IsOptional()
  remarks: string;

  @ApiProperty({
    description: 'Nombre de proyecto'
  })
  @IsString()
  @IsOptional()
  projectName: string;

  @ApiProperty({
    description: 'Transcriptor'
  })
   @IsString()
  @IsOptional()
  transcriber: string;

  @ApiProperty({
    description: 'Fecha de transcripcion'
  })
   @IsDateString()
  @IsOptional()
  transcriptionDate: string;

  @ApiProperty({
    description: 'Revisor'
  })
  @IsString()
  @IsOptional()
  revisorName: string;

  @ApiProperty({
    description: 'Fecha de Revision'
  })
  @IsDateString()
  @IsOptional()
  revisionDate: string;

  @ApiProperty({
    description: 'Nombre del Prologo'
  })
  @IsString()
  @IsOptional()
  prologueName: string;

}


  

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { DictionaryService } from 'src/application/services/dictionary/dictionary.service';
import { CreateDictionaryDto } from 'src/application/common/dto/dictionary/create-dictionary.dto';
import { UpdateDictionaryDto } from 'src/application/common/dto/dictionary/updated-dictionary.dto';
import { PaginationDto } from 'src/application/common/dto/pagination/pagination.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { CreateXMLDto } from 'src/application/common/dto/xml/get-xml.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResponseDictionaryDto } from 'src/application/common/dto/dictionary/response-dictionary.dto';
import { PaginationResultDto } from 'src/application/common/dto/pagination/pagination-result.dto';
import { ResponseEntryDto } from 'src/application/common/dto/entry/response-entry.dto';
import { JwtAuthGuard } from 'src/infrastructure/modules/auth/jwt-auth.guard';
import { RolesGuard } from 'src/application/common/roles-guard/roles.guard';
import UserRole from 'src/core/common/user-role.enum';
import { Roles } from 'src/application/common/roles-guard/roles.decortar';
import { User } from 'src/core/entities/user.entity';

@ApiTags('Dictionaries')
@Controller('dictionaries')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los diccionarios' })  
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Lista de diccionarios paginada',
    type: CreateDictionaryDto,
    isArray: true,
  })
  async findAll(@Query() paginationDto?: PaginationDto) {
    return this.dictionaryService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un diccionario por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del diccionario' })
  @ApiResponse({
    status: 200,
    description: 'Diccionario encontrado',
    type: CreateDictionaryDto,
  })
  @ApiResponse({ status: 404, description: 'Diccionario no encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dictionaryService.findById(id);
  }


  
    @Get('search')
    @ApiOperation({ summary: 'Buscar entradas en todos los diccionarios' })
    @ApiQuery({ name: 'query', required: true, type: String })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })

    async searchAll(
      @Query('query') query: string,
      @Query('page', ParseIntPipe) page: number = 1  
    ) {
      return this.dictionaryService.searchAll(query, page);
    }



  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR) 
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo diccionario' })
  @ApiResponse({
    status: 201,
    description: 'Diccionario creado exitosamente',
    type: CreateDictionaryDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto: el nombre o filename ya existe',
  })
  async create(@Body() createDictionaryDto: CreateDictionaryDto) {
    return this.dictionaryService.create(createDictionaryDto);
  }

  //importar xml

  @Post('import')
  @Roles(UserRole.ADMIN, UserRole.EDITOR) 
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Importar diccionario desde archivo XML' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo XML con la estructura del diccionario',
    type: CreateXMLDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Diccionario importado exitosamente',
    type: ResponseDictionaryDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Formato de archivo inválido o estructura XML incorrecta',
  })
  @ApiResponse({
    status: 500,
    description: 'Error al procesar el archivo XML. Todos los cambios fueron revertidos',
  })
  @UseInterceptors(FileInterceptor('file'))
  async importXML(@Body() xmlDto: CreateXMLDto) {
    return this.dictionaryService.importXML(xmlDto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR) 
  @ApiOperation({ summary: 'Actualizar un diccionario existente' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del diccionario' })
  @ApiResponse({
    status: 200,
    description: 'Diccionario actualizado',
    type: CreateDictionaryDto,
  })
  @ApiResponse({ status: 404, description: 'Diccionario no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Conflicto: el nombre o filename ya existe',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDictionaryDto: UpdateDictionaryDto,
  ) {
    return this.dictionaryService.update(id, updateDictionaryDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR) 
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un diccionario' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del diccionario' })
  @ApiResponse({
    status: 204,
    description: 'Diccionario eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Diccionario no encontrado' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.dictionaryService.delete(id);
  }
}
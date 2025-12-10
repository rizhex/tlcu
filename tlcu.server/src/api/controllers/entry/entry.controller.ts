import {
  Body,
  ClassSerializerInterceptor,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationDto } from 'src/application/common/dto/pagination/pagination.dto';
import { PaginationResultDto } from 'src/application/common/dto/pagination/pagination-result.dto';
import { CreateEntryDto } from 'src/application/common/dto/entry/create-entry.dto';
import { ResponseEntryDto } from 'src/application/common/dto/entry/response-entry.dto';
import { EntryService } from 'src/application/services/entry/entry.service';
import { UpdateEntryDto } from 'src/application/common/dto/entry/update-entry.dto';
import { JwtAuthGuard } from 'src/infrastructure/modules/auth/jwt-auth.guard';
import { RolesGuard } from 'src/application/common/roles-guard/roles.guard';
import UserRole from 'src/core/common/user-role.enum';
import { Roles } from 'src/application/common/roles-guard/roles.decortar';

@ApiTags('Entries')
@Controller('entries')
@UseInterceptors(ClassSerializerInterceptor)
export class EntryController {
  constructor(private readonly entryService: EntryService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las entradas' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ description: 'Lista de entradas paginada', type: PaginationResultDto<ResponseEntryDto> })
  @ApiInternalServerErrorResponse({ description: 'Error interno del servidor' })
  async findAll(@Query() paginationDto?: PaginationDto): Promise<PaginationResultDto<ResponseEntryDto>> {
    try {
      return await this.entryService.findAll(paginationDto);
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch entries');
    }
  }

  @Get('dictionary/:dictionaryId')
  @ApiOperation({ summary: 'Obtener entradas por diccionario' })
  @ApiParam({ name: 'dictionaryId', type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ description: 'Lista de entradas del diccionario', type: PaginationResultDto<ResponseEntryDto> })
  @ApiNotFoundResponse({ description: 'Diccionario no encontrado' })
  @ApiInternalServerErrorResponse({ description: 'Error interno del servidor' })
  async findAllByDictionary(
    @Param('dictionaryId') dictionaryId: number,
    @Query() paginationDto?: PaginationDto
  ): Promise<PaginationResultDto<ResponseEntryDto>> {
    try {
      return await this.entryService.findAllByDictionary(dictionaryId, paginationDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch entries for dictionary');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una entrada por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Entrada encontrada', type: ResponseEntryDto })
  @ApiNotFoundResponse({ description: 'Entrada no encontrada' })
  @ApiInternalServerErrorResponse({ description: 'Error interno del servidor' })
  async findById(@Param('id') id: number): Promise<ResponseEntryDto> {
    try {
      return await this.entryService.findById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch entry');
    }
  }

  @Get('search/dictionary/:dictionaryId')
  @ApiOperation({ summary: 'Buscar entradas en un diccionario' })
  @ApiParam({ name: 'dictionaryId', type: Number })
  @ApiQuery({ name: 'query', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Default: 1' })
  @ApiOkResponse({ description: 'Resultados de búsqueda', type: PaginationResultDto<ResponseEntryDto> })
  @ApiInternalServerErrorResponse({ description: 'Error interno del servidor' })
  async searchEntryInDictionary(
    @Param('dictionaryId') dictionaryId: number,
    @Query('query') query: string,
    @Query('page') page: number = 1
  ): Promise<PaginationResultDto<ResponseEntryDto>> {
    try {
      return await this.entryService.searchEntryInDictionary(dictionaryId, query, page);
    } catch (error) {
      throw new InternalServerErrorException('Failed to search entries');
    }
  }

  @Get('search/all')
  @ApiOperation({ summary: 'Buscar entradas en todos los diccionarios' })
  @ApiQuery({ name: 'query', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Default: 1' })
  @ApiOkResponse({ description: 'Resultados de búsqueda global', type: PaginationResultDto<ResponseEntryDto> })
  @ApiInternalServerErrorResponse({ description: 'Error interno del servidor' })
  async searchAll(
    @Query('query') query: string,
    @Query('page') page: number = 1
  ): Promise<PaginationResultDto<ResponseEntryDto>> {
    try {
      return await this.entryService.searchAll(query, page);
    } catch (error) {
      throw new InternalServerErrorException('Failed to perform global search');
    }
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva entrada' })
  @ApiCreatedResponse({ description: 'Entrada creada exitosamente', type: ResponseEntryDto })
  @ApiConflictResponse({ description: 'La entrada ya existe en el diccionario' })
  @ApiNotFoundResponse({ description: 'Diccionario no encontrado' })
  @ApiBadRequestResponse({ description: 'Datos de entrada inválidos' })
  @ApiInternalServerErrorResponse({ description: 'Error interno del servidor' })
  async create(@Body() createEntryDto: CreateEntryDto): Promise<ResponseEntryDto> {
    try {
      return await this.entryService.create(createEntryDto);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create entry');
    }
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Actualizar una entrada existente' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Entrada actualizada', type: ResponseEntryDto })
  @ApiNotFoundResponse({ description: 'Entrada no encontrada' })
  @ApiBadRequestResponse({ description: 'Datos de entrada inválidos' })
  @ApiInternalServerErrorResponse({ description: 'Error interno del servidor' })
  async update(
    @Param('id') id: number,
    @Body() updateEntryDto: UpdateEntryDto
  ): Promise<ResponseEntryDto> {
    try {
      return await this.entryService.update(id, updateEntryDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update entry');
    }
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una entrada' })
  @ApiParam({ name: 'id', type: Number })
  @ApiNotFoundResponse({ description: 'Entrada no encontrada' })
  @ApiInternalServerErrorResponse({ description: 'Error interno del servidor' })
  async delete(@Param('id') id: number): Promise<void> {
    try {
      await this.entryService.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete entry');
    }
  }

  // Métodos para manejar relaciones padre-hijo

  @Get(':id/children')
  @ApiOperation({ summary: 'Obtener subentradas de una entrada' })
  @ApiParam({ name: 'id', type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ description: 'Lista de subentradas', type: PaginationResultDto<ResponseEntryDto> })
  @ApiNotFoundResponse({ description: 'Entrada padre no encontrada' })
  @ApiInternalServerErrorResponse({ description: 'Error interno del servidor' })
  async getChildren(
    @Param('id') id: number,
    @Query() paginationDto?: PaginationDto
  ): Promise<PaginationResultDto<ResponseEntryDto>> {
    try {
      return await this.entryService.getChildren(id, paginationDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get children entries');
    }
  }

  @Get(':id/parent')
  @ApiOperation({ summary: 'Obtener la entrada padre de una subentrada' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Entrada padre encontrada', type: ResponseEntryDto })
  @ApiNotFoundResponse({ description: 'Entrada o padre no encontrado' })
  @ApiInternalServerErrorResponse({ description: 'Error interno del servidor' })
  async getParent(@Param('id') id: number): Promise<ResponseEntryDto> {
    try {
      return await this.entryService.getParent(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get parent entry');
    }
  }

  @Post(':parentId/children')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Agregar una subentrada' })
  @ApiParam({ name: 'parentId', type: Number })
  @ApiCreatedResponse({ description: 'Subentrada creada', type: ResponseEntryDto })
  @ApiNotFoundResponse({ description: 'Entrada padre no encontrada' })
  @ApiBadRequestResponse({ description: 'Datos de entrada inválidos' })
  @ApiInternalServerErrorResponse({ description: 'Error interno del servidor' })
  async addChild(
    @Param('parentId') parentId: number,
    @Body() createEntryDto: CreateEntryDto
  ): Promise<ResponseEntryDto> {
    try {
      return await this.entryService.addChild(createEntryDto, parentId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to add child entry');
    }
  }

  @Delete('children/:childId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar una subentrada' })
  @ApiParam({ name: 'childId', type: Number })
  @ApiOkResponse({ description: 'Subentrada eliminada', type: ResponseEntryDto })
  @ApiNotFoundResponse({ description: 'Subentrada no encontrada' })
  @ApiInternalServerErrorResponse({ description: 'Error interno del servidor' })
  async deleteChild(@Param('childId') childId: number): Promise<ResponseEntryDto> {
    try {
      return await this.entryService.deleteChild(childId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete child entry');
    }
  }
}
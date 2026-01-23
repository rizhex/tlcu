import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Query,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { DefinitionService } from 'src/application/services/definition/definition.service';
import { ResponseDefinitionDto } from 'src/application/common/dto/definition/response-definition.dto';
import { CreateDefinitionDto } from 'src/application/common/dto/definition/create-definition.dto';
import { UpdateDefinitionDto } from 'src/application/common/dto/definition/update-definition.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/infrastructure/modules/auth/jwt-auth.guard';
import { RolesGuard } from 'src/application/common/roles-guard/roles.guard';
import { Roles } from 'src/application/common/roles-guard/roles.decortar';
import UserRole from 'src/core/common/user-role.enum';

@ApiTags('Definitions')
@Controller('definitions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.EDITOR)
export class DefinitionController {
  constructor(private readonly definitionService: DefinitionService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.EDITOR) 
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva definición' })
  @ApiBody({ type: CreateDefinitionDto })
  @ApiResponse({
    status: 201,
    description: 'Definición creada exitosamente',
    type: ResponseDefinitionDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 409, description: 'Conflicto - La definición ya existe' })
  async create(
    @Body() createDefinitionDto: CreateDefinitionDto,
  ): Promise<ResponseDefinitionDto> {
    return this.definitionService.create(createDefinitionDto);
  }

  
    @Put(':id')
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.EDITOR) 
    @ApiOperation({ summary: 'Actualizar una definicion existente' })
    @ApiParam({ name: 'id', type: Number, description: 'ID de definition' })
    @ApiResponse({
      status: 200,
      description: 'Definicion actualizado',
      type: CreateDefinitionDto,
    })
    @ApiResponse({ status: 404, description: 'Definicion no encontrado' })
    @ApiResponse({
      status: 409,
      description: 'Conflicto: el nombre o filename ya existe',
    })
    async update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateDefinitionDto: UpdateDefinitionDto,
    ) {
      return this.definitionService.update(id, updateDefinitionDto);
    }


  
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR) 
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una definición' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Definición eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Definición no encontrada' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.definitionService.delete(id);
  }
}
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
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserService } from 'src/application/services/user/user.service';
import { CreateUserDto } from 'src/application/common/dto/user/create-user.dto';
import { UpdateUserDto } from 'src/application/common/dto/user/update-user.dto';
import { ResponseUserDto } from 'src/application/common/dto/user/response-user.dto';
import { PaginationDto } from 'src/application/common/dto/pagination/pagination.dto';
import { PaginationResultDto } from 'src/application/common/dto/pagination/pagination-result.dto';
import { Roles } from 'src/application/common/roles-guard/roles.decortar';
import UserRole from 'src/core/common/user-role.enum';
import { RolesGuard } from 'src/application/common/roles-guard/roles.guard';
import { JwtAuthGuard } from 'src/infrastructure/modules/auth/jwt-auth.guard';
import { User } from 'src/core/entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of users',
    type: PaginationResultDto<ResponseUserDto>,
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query() paginationDto?: PaginationDto,
  ): Promise<PaginationResultDto<ResponseUserDto>> {
    return this.userService.findAll(paginationDto);
  }

  @Get('search')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Search users by query' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Search results',
    type: PaginationResultDto<ResponseUserDto>,
  })
  @ApiQuery({ name: 'query', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  async searchAll(
    @Query('query') query: string,
    @Query('page') page = 1,
  ): Promise<PaginationResultDto<ResponseUserDto>> {
    return this.userService.searchAll(query, page);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The found user',
    type: ResponseUserDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiParam({ name: 'id', required: true, type: String })
  async findOne(@Param('id') id: string): Promise<ResponseUserDto> {
    return this.userService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The user has been successfully created',
    type: ResponseUserDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Username or email already exists',
  })
  @ApiBody({ type: CreateUserDto })
  async create(@Body() createUserDto: CreateUserDto): Promise<ResponseUserDto> {
    return this.userService.create(createUserDto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The user has been successfully updated',
    type: ResponseUserDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Username or email already in use',
  })
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiBody({ type: UpdateUserDto })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ResponseUserDto> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The user has been successfully deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiParam({ name: 'id', required: true, type: String })
  async remove(@Param('id') id: string): Promise<void> {
    return this.userService.delete(id);
  }

  @Put(':id/activate')
  @ApiOperation({ summary: 'Activate user account' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User account activated',
    type: ResponseUserDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiParam({ name: 'id', required: true, type: String })
  async activate(@Param('id') id: string): Promise<ResponseUserDto> {
    return this.userService.activate(id);
  }

  @Put(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate user account' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User account deactivated',
    type: ResponseUserDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiParam({ name: 'id', required: true, type: String })
  async deactivate(@Param('id') id: string): Promise<ResponseUserDto> {
    return this.userService.deactivate(id);
  }
}
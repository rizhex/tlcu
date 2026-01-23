import { 
  ConflictException, 
  Injectable, 
  InternalServerErrorException, 
  NotFoundException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { User } from 'src/core/entities/user.entity';
import { CreateUserDto } from 'src/application/common/dto/user/create-user.dto';
import { UpdateUserDto } from 'src/application/common/dto/user/update-user.dto';
import { ResponseUserDto } from 'src/application/common/dto/user/response-user.dto';
import { PaginationDto } from 'src/application/common/dto/pagination/pagination.dto';
import { PaginationResultDto } from 'src/application/common/dto/pagination/pagination-result.dto';
import * as bcrypt from 'bcrypt';
import { UserMapper } from 'src/application/common/mapper/user.mapper';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async findAll(paginationDto?: PaginationDto): Promise<PaginationResultDto<ResponseUserDto>> {
    const page = paginationDto?.page || 1;
    const limit = paginationDto?.limit || 50;
    const skip = (page - 1) * limit;

    const [entities, total] = await this.userRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      select: ['id', 'username', 'email', 'role', 'isActive', 'createdAt', 'updatedAt']
    });

    return {
      data: entities.map(user => UserMapper.toDto(user)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findById(id: string): Promise<ResponseUserDto> {
    const user = await this.userRepository.findOne({ 
      where: { id },
      select: ['id', 'username', 'email', 'role', 'isActive', 'createdAt', 'updatedAt']
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return UserMapper.toDto(user);
  }

  async findByUsername(username: string): Promise<User | null>{
    return this.userRepository.findOne({
      where: {username},
      select: ['id', 'username', 'email', 'password', 'role', 'isActive']
    })
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ 
      where: { email },
      select: ['id', 'username', 'email', 'password', 'role', 'isActive']
    });
  }

  async searchAll(
    query: string,
    page: number
  ): Promise<PaginationResultDto<ResponseUserDto>> {
    try {
      const pageSize = 50;
      const skip = (page - 1) * pageSize;

      const whereConditions: any = {};
      if (query) {
        whereConditions.username = Like(`%${query.toLowerCase()}%`);
        whereConditions.email = Like(`%${query.toLowerCase()}%`);
      }

      const [entities, total] = await this.userRepository.findAndCount({
        where: whereConditions,
        skip: skip,
        take: pageSize,
        order: { createdAt: 'DESC' },
        select: ['id', 'username', 'email', 'role', 'isActive', 'createdAt', 'updatedAt']
      });

      const data = entities.map(user => UserMapper.toDto(user));

      const totalPages = Math.ceil(total / pageSize);

      return {
        data,
        total,
        page,
        limit: pageSize,
        totalPages
      };
    } catch (error) {
      console.error('Error performing user search:', error);
      throw new InternalServerErrorException(
        'Failed to perform user search. Please try again later.'
      );
    }
  }

  async create(createUserDto: CreateUserDto): Promise<ResponseUserDto> {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await this.userRepository.findOne({
        where: [
          { username: createUserDto.username },
          { email: createUserDto.email }
        ],
      });

      if (existingUser) {
        if (existingUser.username === createUserDto.username) {
          throw new ConflictException('Username already exists');
        }
        if (existingUser.email === createUserDto.email) {
          throw new ConflictException('Email already exists');
        }
      }

      // Hashear la contraseña
      const hashedPassword = await this.hashPassword(createUserDto.password);

      // Crear el nuevo usuario
      const newUser = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword
      });
      newUser.isActive= true;
      const savedUser = await this.userRepository.save(newUser);
      return UserMapper.toDto(savedUser);

    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      console.error('Error creating user:', error);
      throw new InternalServerErrorException(
        'Failed to create user. Please try again later.'
      );
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<ResponseUserDto> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Verificar si el nuevo email o username ya existen
      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const emailExists = await this.userRepository.findOne({ 
          where: { email: updateUserDto.email } 
        });
        if (emailExists) {
          throw new ConflictException('Email already in use by another user');
        }
      }

      if (updateUserDto.username && updateUserDto.username !== user.username) {
        const usernameExists = await this.userRepository.findOne({ 
          where: { username: updateUserDto.username } 
        });
        if (usernameExists) {
          throw new ConflictException('Username already in use by another user');
        }
      }

      // Hashear la nueva contraseña si se proporciona
      if (updateUserDto.password) {
        updateUserDto.password = await this.hashPassword(updateUserDto.password);
      }

      // Actualizar el usuario
      const updatedUser = this.userRepository.merge(user, updateUserDto);
      const savedUser = await this.userRepository.save(updatedUser);
      
      return UserMapper.toDto(savedUser);

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      console.error(`Error updating user ${id}:`, error);
      throw new InternalServerErrorException(
        'Failed to update user. Please try again later.'
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const result = await this.userRepository.delete(id);
      
      if (result.affected === 0) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error deleting user ${id}:`, error);
      throw new InternalServerErrorException(
        'Failed to delete user. Please try again later.'
      );
    }
  }

  async deactivate(id: string): Promise<ResponseUserDto> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      user.isActive = false;
      const savedUser = await this.userRepository.save(user);
      
      return UserMapper.toDto(savedUser);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error deactivating user ${id}:`, error);
      throw new InternalServerErrorException(
        'Failed to deactivate user. Please try again later.'
      );
    }
  }

  async activate(id: string): Promise<ResponseUserDto> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      user.isActive = true;
      const savedUser = await this.userRepository.save(user);
      
      return UserMapper.toDto(savedUser);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error activating user ${id}:`, error);
      throw new InternalServerErrorException(
        'Failed to activate user. Please try again later.'
      );
    }
  }

}
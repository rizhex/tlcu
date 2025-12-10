import { User } from "src/core/entities/user.entity";
import { ResponseUserDto } from "../dto/user/response-user.dto";
import { CreateUserDto } from "../dto/user/create-user.dto";

export class UserMapper {
  
  public static toDto(entity: User): ResponseUserDto {
    const dto = new ResponseUserDto();
    
    dto.id = entity.id;
    dto.username = entity.username;
    dto.role = entity.role;
    dto.email = entity.email;

    return dto;
  }

  
  public static toDtoArray(entities: User[]): ResponseUserDto[] {
    return entities.map(entity => this.toDto(entity));
  }

  public static toEntityArray(dtos: CreateUserDto[]): User[]{
    return dtos.map(dto=>this.toEntity(dto));
  }

   
  public static toEntity(dto: CreateUserDto): User {
    const entity = new User();
    
    entity.username = dto.username;
    entity.password = dto.password;
    entity.email = dto.email;
    entity.password = dto.password;
    entity.isActive = true;
    entity.role = dto.role;

    return entity;
  }
/*
  public static partialToEntity(dto: UpdateEntryDto): Partial<Entry> {
    const partialEntity: Partial<Entry> = {};
    if(dto.name !== undefined) partialEntity.name = dto.name;
    if(dto.regName !== undefined) partialEntity.regName = dto.regName;

    return partialEntity;
  }*/
}
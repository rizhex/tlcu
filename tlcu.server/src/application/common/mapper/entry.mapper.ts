
import { Entry } from "src/core/entities/entry.entity";
import { CreateEntryDto } from "../dto/entry/create-entry.dto";
import { ResponseEntryDto } from "../dto/entry/response-entry.dto";
import { UpdateEntryDto } from "../dto/entry/update-entry.dto";
import { DefinitionMapper } from "./definition.mapper";

export class EntryMapper {
  
  public static toDto(entity: Entry): ResponseEntryDto {
    const dto = new ResponseEntryDto();
    
    dto.id = entity.id;
    dto.name = entity.name;
    dto.regName = entity.regName;
    dto.isChild = entity.isChild;
    dto.isParent = entity.isParent;
    
    // Mapear las definiciones si existen
    if (entity.definitions) {
      dto.definitions = DefinitionMapper.toDtoArray(entity.definitions);
    }

    return dto;
  }

  public static toDtoArray(entities: Entry[]): ResponseEntryDto[] {
    return entities.map(entity => this.toDto(entity));
  }

  public static toEntityArray(dtos: CreateEntryDto[]): Entry[] {
    return dtos.map(dto => this.toEntity(dto));
  }

  public static toEntity(dto: CreateEntryDto): Entry {
    const entity = new Entry();
    
    entity.name = dto.name;
    entity.regName = dto.regName;

    return entity;
  }

  public static partialToEntity(dto: UpdateEntryDto): Partial<Entry> {
    const partialEntity: Partial<Entry> = {};
    
    if (dto.name !== undefined) partialEntity.name = dto.name;
    if (dto.regName !== undefined) partialEntity.regName = dto.regName;
    

    return partialEntity;
  }
}
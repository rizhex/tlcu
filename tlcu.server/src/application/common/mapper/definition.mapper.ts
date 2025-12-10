import { Definition } from "src/core/entities/definition.entity";
import { ResponseDefinitionDto } from "../dto/definition/response-definition.dto";
import { CreateDefinitionDto } from "../dto/definition/create-definition.dto";
import { UpdateDefinitionDto } from "../dto/definition/update-definition.dto";

export class DefinitionMapper {
  
  public static toDto(entity: Definition): ResponseDefinitionDto {
    const dto = new ResponseDefinitionDto();
    
    dto.id = entity.id;
    dto.defText = entity.defText
    dto.etymology = entity.etymology
    dto.ontologicalClassification = entity.ontologicalClassification
    dto.wordClass = entity.wordClass
    dto.senseNumber = entity.senseNumber
    dto.remarks = entity.remarks

    return dto;
  }

  
  public static toDtoArray(entities: Definition[]): ResponseDefinitionDto[] {
    return entities.map(entity => this.toDto(entity));
  }

  public static toEntityArray(dtos: CreateDefinitionDto[]): Definition[]{
    return dtos.map(dto=>this.toEntity(dto));
  }

   
  public static toEntity(dto: CreateDefinitionDto): Definition {
    const entity = new Definition();
    
    entity.wordClass = dto.wordClass
    entity.ontologicalClassification = dto.ontologicalClassification
    entity.defText = dto.defText
    entity.etymology = dto.etymology
    entity.senseNumber = dto.senseNumber
    entity.remarks = dto.remarks

    return entity;
  }

  public static partialToEntity(dto: UpdateDefinitionDto): Partial<Definition> {
    const partialEntity: Partial<Definition> = {};

    if(dto.defText !== undefined) partialEntity.defText = dto.defText
    if(dto.etymology !== undefined) partialEntity.etymology = dto.etymology
    if(dto.senseNumber !== undefined) partialEntity.senseNumber = dto.senseNumber
    if(dto.remarks !== undefined) partialEntity.remarks = dto.remarks

    return partialEntity;
  }
}
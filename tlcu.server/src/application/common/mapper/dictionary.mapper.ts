import { Dictionary } from "src/core/entities/dictionary.entity";
import { CreateDictionaryDto } from "../dto/dictionary/create-dictionary.dto";
import { UpdateDictionaryDto } from "../dto/dictionary/updated-dictionary.dto";
import { ResponseDictionaryDto } from "../dto/dictionary/response-dictionary.dto";

export class DictionaryMapper {
  
  public static toDto(entity: Dictionary): ResponseDictionaryDto {
    const dto = new ResponseDictionaryDto();
    
    dto.id = entity.id;
    dto.name = entity.name;
    dto.title = entity.title;
    dto.fullTitle = entity.fullTitle;
    dto.author = entity.author;
    dto.originalDate = entity.originalDate;
    dto.century = entity.century;
    dto.publishingPlace = entity.publishingPlace;
    dto.publisher = entity.publisher;
    dto.publishingDate = entity.publishingDate;
    dto.edition = entity.edition;
    dto.sourceName = entity.sourceName;
    dto.remarks = entity.remarks;
    dto.projectName = entity.projectName;
    dto.transcriber = entity.transcriber;
    dto.transcriptionDate = entity.transcriptionDate;
    dto.revisorName = entity.revisorName;
    dto.revisionDate = entity.revisionDate;
    dto.prologueName = entity.prologueName;

    return dto;
  }

  
  public static toDtoArray(entities: Dictionary[]): ResponseDictionaryDto[] {
    return entities.map(entity => this.toDto(entity));
  }

  public static toEntityArray(dtos: CreateDictionaryDto[]): Dictionary[]{
    return dtos.map(dto=>this.toEntity(dto));
  }

   
  public static toEntity(dto: CreateDictionaryDto): Dictionary {
    const entity = new Dictionary();
    
    entity.name = dto.name;
    entity.title = dto.title;
    entity.fullTitle = dto.fullTitle;
    entity.author = dto.author;
    entity.originalDate = dto.originalDate;
    entity.century = dto.century;
    entity.publishingPlace = dto.publishingPlace;
    entity.publisher = dto.publisher;
    entity.publishingDate = dto.publishingDate;
    entity.edition = dto.edition;
    entity.sourceName = dto.sourceName;
    entity.remarks = dto.remarks;
    entity.projectName = dto.projectName;
    entity.transcriber = dto.transcriber;
    entity.transcriptionDate = dto.transcriptionDate;
    entity.revisorName = dto.revisorName;
    entity.revisionDate = dto.revisionDate;
    entity.prologueName = dto.prologueName;

    return entity;
  }

  public static partialToEntity(dto: UpdateDictionaryDto): Partial<Dictionary> {
    const partialEntity: Partial<Dictionary> = {};

    if (dto.name !== undefined) partialEntity.name = dto.name;
    if (dto.title !== undefined) partialEntity.title = dto.title;
    if (dto.fullTitle !== undefined) partialEntity.fullTitle = dto.fullTitle;
    if (dto.author !== undefined) partialEntity.author = dto.author;
    if (dto.originalDate !== undefined) partialEntity.originalDate = dto.originalDate;
    if (dto.century !== undefined) partialEntity.century = dto.century;
    if (dto.publishingPlace !== undefined) partialEntity.publishingPlace = dto.publishingPlace;
    if (dto.publisher !== undefined) partialEntity.publisher = dto.publisher;
    if (dto.publishingDate !== undefined) partialEntity.publishingDate = dto.publishingDate;
    if (dto.edition !== undefined) partialEntity.edition = dto.edition;
    if (dto.sourceName !== undefined) partialEntity.sourceName = dto.sourceName;
    if (dto.remarks !== undefined) partialEntity.remarks = dto.remarks;
    if (dto.projectName !== undefined) partialEntity.projectName = dto.projectName;
    if (dto.transcriber !== undefined) partialEntity.transcriber = dto.transcriber;
    if (dto.transcriptionDate !== undefined) partialEntity.transcriptionDate = dto.transcriptionDate;
    if (dto.revisorName !== undefined) partialEntity.revisorName = dto.revisorName;
    if (dto.revisionDate !== undefined) partialEntity.revisionDate = dto.revisionDate;
    if (dto.prologueName !== undefined) partialEntity.prologueName = dto.prologueName;

    return partialEntity;
  }
}
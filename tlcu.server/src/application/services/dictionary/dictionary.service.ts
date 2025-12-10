import { ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dictionary } from 'src/core/entities/dictionary.entity';
import { Like, Repository } from 'typeorm';
import { PaginationDto } from 'src/application/common/dto/pagination/pagination.dto';
import { PaginationResultDto } from 'src/application/common/dto/pagination/pagination-result.dto';
import { DictionaryMapper } from 'src/application/common/mapper/dictionary.mapper';
import { CreateDictionaryDto } from 'src/application/common/dto/dictionary/create-dictionary.dto';
import { UpdateDictionaryDto } from 'src/application/common/dto/dictionary/updated-dictionary.dto';
import { ResponseDictionaryDto } from 'src/application/common/dto/dictionary/response-dictionary.dto';
import { Entry } from 'src/core/entities/entry.entity';
import { Definition } from 'src/core/entities/definition.entity';
import { CreateXMLDto } from 'src/application/common/dto/xml/get-xml.dto';
import * as xml2js from 'xml2js';

@Injectable()
export class DictionaryService {

    constructor(
        @InjectRepository(Dictionary)
        private dictionaryRepository: Repository<Dictionary>,
        @InjectRepository(Entry)
        private entryRepository: Repository<Entry>,
        @InjectRepository(Definition)
        private definitionRepository: Repository<Definition>,
    ) {}

    async findAll(paginationDto?: PaginationDto): Promise<PaginationResultDto<ResponseDictionaryDto>> {
        
        const page = 1;
        const limit = 50;
        const skip = (page - 1) * limit;

        const [entities, total] = await this.dictionaryRepository.findAndCount({
            skip: skip,
            take: limit,
            order: { id: 'ASC' }
        });

        const data = DictionaryMapper.toDtoArray(entities);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async findById(id: number): Promise<ResponseDictionaryDto> {
        const entity = await this.dictionaryRepository.findOne({ 
            where: { id },
        });

        if (!entity) {
            throw new NotFoundException(`Dictionary with ID ${id} not found`);
        }

        return DictionaryMapper.toDto(entity);
    }

    async searchAll(
            query: string,
            page: number
        ): Promise<PaginationResultDto<ResponseDictionaryDto>> {
            try {
                const pageSize = 50;
                const skip = (page - 1) * pageSize;
    
                const whereConditions: any = {};
                if (query) {
                    whereConditions.name = Like(`%${query.toLowerCase()}%`);
                }
    
                const [entities, total] = await this.dictionaryRepository.findAndCount({
                    where: whereConditions,
                    skip: skip,
                    take: pageSize,
                    order: { id: 'ASC' }
                });
    
                const data = DictionaryMapper.toDtoArray(entities);
    
                const totalPages = Math.ceil(total / pageSize);
    
                return {
                    data,
                    total,
                    page,
                    limit: pageSize,
                    totalPages
                };
            } catch (error) {
                console.error('Error performing global dictionary search:', error);
                throw new InternalServerErrorException(
                    'Failed to perform global search. Please try again later.'
                );
            }
        }

    async create(dictionaryDto: CreateDictionaryDto): Promise<ResponseDictionaryDto> {
    try {
      const existingDictionary = await this.dictionaryRepository.findOne({
        where: [
          { name: dictionaryDto.name }
        ],
      });

      if (existingDictionary) {
        throw new ConflictException(
          'A dictionary with this name or filename already exists'
        );
      }

      const dictionaryEntity = DictionaryMapper.toEntity(dictionaryDto);

      const savedEntity = await this.dictionaryRepository.save(dictionaryEntity);

      return DictionaryMapper.toDto(savedEntity);

    } catch (error) {
      if (error instanceof ConflictException) {
        throw error; 
      }
      console.error('Error creating dictionary:', error);
      throw new InternalServerErrorException(
        'Failed to create dictionary. Please try again later.'
      );
    }
}

    async update(id: number, updateDto: UpdateDictionaryDto): Promise<ResponseDictionaryDto> {
        try {
            const existingDictionary = await this.dictionaryRepository.findOne({ 
                where: { id } 
            });
            
            if (!existingDictionary) {
                throw new NotFoundException(`Dictionary with ID ${id} not found`);
            }

            const updatedEntity = this.dictionaryRepository.merge(
                existingDictionary,
                DictionaryMapper.partialToEntity(updateDto)
            );

            if (updatedEntity['updatedAt'] !== undefined) {
                updatedEntity['updatedAt'] = new Date();
            }

            const savedEntity = await this.dictionaryRepository.save(updatedEntity);
            return DictionaryMapper.toDto(savedEntity);

        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }
            console.error(`Error updating dictionary ${id}:`, error);
            throw new InternalServerErrorException(
                'Failed to update dictionary. Please try again later.'
            );
        }
    }
async delete(id: number): Promise<void> {
    const queryRunner = this.dictionaryRepository.manager.connection.createQueryRunner();
    
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        // Cargar el diccionario con todas sus relaciones
        const dictionary = await queryRunner.manager.findOne(Dictionary, {
            where: { id },
            relations: [
                'entries', 
                'entries.definitions',
                'entries.subEntries',
                'entries.subEntries.definitions'
            ]
        });

        if (!dictionary) {
            throw new NotFoundException(`Dictionary with ID ${id} not found`);
        }

        // Eliminar definiciones de sub-entradas primero
        for (const entry of dictionary.entries) {
            if (entry.subEntries?.length) {
                for (const subEntry of entry.subEntries) {
                    if (subEntry.definitions?.length) {
                        await queryRunner.manager.remove(Definition, subEntry.definitions);
                    }
                }
                await queryRunner.manager.remove(Entry, entry.subEntries);
            }
            
            if (entry.definitions?.length) {
                await queryRunner.manager.remove(Definition, entry.definitions);
            }
        }
        if (dictionary.entries?.length) {
            await queryRunner.manager.remove(Entry, dictionary.entries);
        }

        await queryRunner.manager.delete(Dictionary, id);

        await queryRunner.commitTransaction();
    } catch (error) {
        await queryRunner.rollbackTransaction();
        
        if (error instanceof NotFoundException) {
            throw error;
        }
        
        console.error(`Error deleting dictionary ${id}:`, error);
        throw new InternalServerErrorException(
            'Failed to delete dictionary. Please try again later.'
        );
    } finally {
        await queryRunner.release();
    }
}

    //----IMPORTAR XML: me falta todavia ponerle indicar la linea donde hubo error en caso de q haya
async importXML(xmlDto: CreateXMLDto): Promise<ResponseDictionaryDto> {
    const queryRunner = this.dictionaryRepository.manager.connection.createQueryRunner();
    
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        // 1. Parsear XML
        const parser = new xml2js.Parser({ explicitArray: false });
        const result = await parser.parseStringPromise(xmlDto.content);
        const xdxf = result.xdxf;

        // 2. Crear y guardar diccionario
        const dictionary = this.importDictionary(xdxf.meta_info);
        const savedDictionary = await queryRunner.manager.save(Dictionary, dictionary);

        // 3. Procesar entradas y definiciones
        const lexicon = Array.isArray(xdxf.lexicon.ar) ? xdxf.lexicon.ar : [xdxf.lexicon.ar];
        
        for (const ar of lexicon) {
            const entry = this.importEntry(ar, savedDictionary);
            const savedEntry = await queryRunner.manager.save(Entry, entry);

            // Inicializar array de definiciones
            savedEntry.definitions = [];

            if (ar.def) {
                const defs = Array.isArray(ar.def) ? ar.def : [ar.def];
                const definitionsToSave: Definition[] = []; // Tipo explícito
                
                // Preparar definiciones (sin await aquí)
                for (const def of defs) {
                    const definition = await this.importDefinition(def, savedEntry); // No debe ser async
                    definitionsToSave.push(definition);
                }

                // Guardar todas las definiciones en una sola operación
                const savedDefinitions = await queryRunner.manager.save(Definition, definitionsToSave);
                savedEntry.definitions.push(...savedDefinitions);
                
                // Actualizar entrada con las definiciones
                await queryRunner.manager.save(Entry, savedEntry);
            }
        }

        await queryRunner.commitTransaction();
        return DictionaryMapper.toDto(savedDictionary);

    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error('Error importing XML:', error);
        
        if (error instanceof InternalServerErrorException) {
            throw error;
        }
        throw new InternalServerErrorException(
            'Failed to import XML. All changes have been reverted. Please check the file format and try again.'
        );
    } finally {
        await queryRunner.release();
    }
}

  private async importDefinition(def: any, entry): Promise<Definition>{
    const definition = new Definition();
    definition.wordClass = def.gr?.$?.val || '';
    definition.ontologicalClassification = def.categ?.$?.val || '';
    definition.senseNumber = def.$.n || 1;
    definition.etymology = def.etym?.$?.val || '';
    definition.defText = def.deftext || '';
    
    return definition;
  }


 private importEntry(ar: any, dictionary: Dictionary): Entry {
    const entry = new Entry();
    entry.dictionary = dictionary;
    
    if (typeof ar.k === 'string') {
        entry.name = ar.k;
        entry.regName = ar.k;
    } else if (ar.k._) {
        entry.name = ar.k._;
        entry.regName = ar.k.$.reg || ar.k._;
    } else {
        entry.name = ar.k;
        entry.regName = ar.k;
    }
    
    entry.isChild = false;
    entry.isParent = false;
    
    return entry;
}

  private importDictionary(metaInfo: any): Dictionary {
    const dictionary = new Dictionary();
    dictionary.name = metaInfo.title;
    dictionary.title = metaInfo.title;
    dictionary.fullTitle = metaInfo.full_title;
    dictionary.originalDate = '';
    dictionary.century = '';
    dictionary.sourceName = '';
    dictionary.remarks = '';
    dictionary.transcriptionDate = '';
    dictionary.revisorName = '';
    dictionary.revisionDate = '';
    dictionary.prologueName = '';
    dictionary.publishingDate = metaInfo.publishing_date || '';
    dictionary.publishingPlace = metaInfo.publishing_place || '';
    dictionary.publisher = metaInfo.publisher || '';
    dictionary.edition = metaInfo.dict_edition || '';
    dictionary.projectName = metaInfo.project_name || '';
    dictionary.transcriber = metaInfo.transcription_author || '';
    dictionary.author = metaInfo.authors || '';
    
    return dictionary;
  }

}



import { ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException, NotImplementedException } from '@nestjs/common';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDefinitionDto } from 'src/application/common/dto/definition/create-definition.dto';
import { UpdateDictionaryDto } from 'src/application/common/dto/dictionary/updated-dictionary.dto';
import { CreateEntryDto } from 'src/application/common/dto/entry/create-entry.dto';
import { ResponseEntryDto } from 'src/application/common/dto/entry/response-entry.dto';
import { UpdateEntryDto } from 'src/application/common/dto/entry/update-entry.dto';
import { PaginationResultDto } from 'src/application/common/dto/pagination/pagination-result.dto';
import { PaginationDto } from 'src/application/common/dto/pagination/pagination.dto';
import { DefinitionMapper } from 'src/application/common/mapper/definition.mapper';
import { EntryMapper } from 'src/application/common/mapper/entry.mapper';
import { Definition } from 'src/core/entities/definition.entity';
import { Dictionary } from 'src/core/entities/dictionary.entity';
import { Entry } from 'src/core/entities/entry.entity';
import { Like, Repository } from 'typeorm';

@Injectable()
export class EntryService {

    constructor(
        @InjectRepository(Entry) private entryRepository: Repository<Entry>,
        @InjectRepository(Dictionary) private dictionaryRepository: Repository<Dictionary>,
        @InjectRepository(Definition) private definitionRepository: Repository<Definition>
    ) {}

    async findAll(paginationDto?: PaginationDto): Promise<PaginationResultDto<ResponseEntryDto>> {
        const page = paginationDto?.page || 1; 
        const limit = paginationDto?.limit || 50;
        const skip = (page -1) * limit;

        const [entities, total] = await this.entryRepository.findAndCount({
            skip: skip, 
            take: limit,
            order: {id: 'ASC'},
            relations: ['definitions'] 
        });
        
        const data = EntryMapper.toDtoArray(entities);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async findAllByDictionary(
        dictionaryId: number,
        paginationDto?: PaginationDto
    ): Promise<PaginationResultDto<ResponseEntryDto>> {
        try {
            const page = paginationDto?.page || 1;
            const limit = paginationDto?.limit || 50;
            const skip = (page - 1) * limit;

            const dictionaryExists = await this.dictionaryRepository.findOne({ 
                where: { id: dictionaryId } 
            });
            
            if (!dictionaryExists) {
                throw new NotFoundException(`Dictionary with ID ${dictionaryId} not found`);
            }

            const [entities, total] = await this.entryRepository.findAndCount({
                where: { dictionary: { id: dictionaryId } },
                skip: skip,
                take: limit,
                order: { id: 'ASC' },
                relations: ['dictionary', 'definitions'] 
            });

            const data = EntryMapper.toDtoArray(entities);

            return {
                data,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            };
            
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error(`Error fetching entries for dictionary ${dictionaryId}:`, error);
            throw new InternalServerErrorException(
                'Failed to fetch entries. Please try again later.'
            );
        }
    }

    async findById(id: number): Promise<ResponseEntryDto> {
        const entity = await this.entryRepository.findOne({
            where: { id },
            relations: ['definitions'] 
        });

        if (!entity) {
            throw new NotFoundException(`Entry with ID ${id} not found`);
        }

        return EntryMapper.toDto(entity);
    }

    async searchEntryInDictionary(
        dictionaryId: number,
        query: string,
        page: number
    ): Promise<PaginationResultDto<ResponseEntryDto>> {
        try {
            const pageSize = 50;
            const skip = (page - 1) * pageSize;

            const whereConditions: any = { dictionary: { id: dictionaryId } };
            if (query) {
                whereConditions.name = Like(`%${query.toLowerCase()}%`);
            }

            const [entries, total] = await this.entryRepository.findAndCount({
                where: whereConditions,
                skip: skip,
                take: pageSize,
                order: { id: 'ASC' },
                relations: ['definitions'] 
            });

            const data = EntryMapper.toDtoArray(entries);

            const totalPages = Math.ceil(total / pageSize);

            return {
                data,
                total,
                page,
                limit: pageSize,
                totalPages
            };
        } catch (error) {
            console.error(`Error searching entries for dictionary ${dictionaryId}:`, error);
            throw new InternalServerErrorException(
                'Failed to search entries. Please try again later.'
            );
        }
    }

    async searchAll(
        query: string,
        page: number
    ): Promise<PaginationResultDto<ResponseEntryDto>> {
        try {
            const pageSize = 50;
            const skip = (page - 1) * pageSize;

            const whereConditions: any = {};
            if (query) {
                whereConditions.name = Like(`%${query.toLowerCase()}%`);
            }

            const [entries, total] = await this.entryRepository.findAndCount({
                where: whereConditions,
                skip: skip,
                take: pageSize,
                order: { id: 'ASC' },
                relations: ['definitions'] 
            });

            const data = EntryMapper.toDtoArray(entries);

            const totalPages = Math.ceil(total / pageSize);

            return {
                data,
                total,
                page,
                limit: pageSize,
                totalPages
            };
        } catch (error) {
            console.error('Error performing global entry search:', error);
            throw new InternalServerErrorException(
                'Failed to perform global search. Please try again later.'
            );
        }
    }

    async create(entryDto: CreateEntryDto): Promise<ResponseEntryDto> {
        const queryRunner = this.entryRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const existingEntry = await queryRunner.manager.findOne(Entry, {
                where: { name: entryDto.name, dictionary: { id: entryDto.dictionaryId } }
            });
            if (existingEntry) throw new ConflictException('Entry with this name already exists in this dictionary');

            const dictionary = await queryRunner.manager.findOne(Dictionary, {
                where: { id: entryDto.dictionaryId }
            });
            if (!dictionary) throw new NotFoundException(`Dictionary with ID ${entryDto.dictionaryId} not found`);

            const entryEntity = EntryMapper.toEntity(entryDto);
            entryEntity.isParent = false;
            entryEntity.isChild = false;
            entryEntity.dictionary = dictionary;
            entryEntity.definitions = [];
            
            const savedEntry = await queryRunner.manager.save(Entry, entryEntity);

            if (entryDto.definitions?.length) {
                const definitions = entryDto.definitions.map(dto => {
                    const definition = DefinitionMapper.toEntity(dto);
                    definition.entry = savedEntry;
                    return definition;
                });
                savedEntry.definitions = await queryRunner.manager.save(Definition, definitions);
                await queryRunner.manager.save(Entry, savedEntry);
            }

            await queryRunner.commitTransaction();

            const completeEntry = await this.entryRepository.findOne({
                where: { id: savedEntry.id },
                relations: ['definitions']
            });
            
            if (!completeEntry) throw new InternalServerErrorException('Failed to retrieve created entry');
            return EntryMapper.toDto(completeEntry);

        } catch (error) {
            await queryRunner.rollbackTransaction();
            if (error instanceof ConflictException || error instanceof NotFoundException) throw error;
            
            console.error('Error creating entry:', error);
            throw new InternalServerErrorException('Failed to create entry. Please try again later.');
        } finally {
            await queryRunner.release();
        }
    }
async update(id: number, updateDto: UpdateEntryDto): Promise<ResponseEntryDto> {
    const queryRunner = this.entryRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const existingEntry = await queryRunner.manager.findOne(Entry, { 
            where: { id },
            relations: ['definitions']
        });
        
        if (!existingEntry) {
            throw new NotFoundException(`Entry with ID ${id} not found`);
        }

        const updatedEntity = queryRunner.manager.merge(
            Entry,
            existingEntry,
            EntryMapper.partialToEntity(updateDto)
        );

        if (updateDto.definitions) {
            const updatedDefinitions: Definition[] = [];
            const newDefinitions: Definition[] = [];

            for (const definitionDto of updateDto.definitions) {
                if (definitionDto.id) {

                    const existingDef = existingEntry.definitions.find(d => d.id === definitionDto.id);
                    if (existingDef) {

                        const updatedDef = {
                            ...existingDef,
                            ...DefinitionMapper.partialToEntity(definitionDto),
                            id: existingDef.id 
                        };
                        updatedDefinitions.push(updatedDef);
                    }
                } else {
                    
                    const newDef = DefinitionMapper.toEntity({
                        ...definitionDto,
                        entryId: id
                    } as CreateDefinitionDto);
                    newDef.entry = existingEntry;
                    newDefinitions.push(newDef);
                }
            }

            const savedDefinitions = await queryRunner.manager.save(Definition, [
                ...updatedDefinitions,
                ...newDefinitions
            ]);

            const definitionIdsToKeep = updateDto.definitions
                .map(d => d.id)
                .filter(id => id) as number[];
                
            const definitionsToRemove = existingEntry.definitions
                .filter(def => !definitionIdsToKeep.includes(def.id));

            if (definitionsToRemove.length > 0) {
                await queryRunner.manager.delete(Definition, definitionsToRemove.map(d => d.id));
            }

            updatedEntity.definitions = savedDefinitions;
        }

        const savedEntity = await queryRunner.manager.save(Entry, updatedEntity);
        await queryRunner.commitTransaction();

        const completeEntry = await this.entryRepository.findOne({
            where: { id: savedEntity.id },
            relations: ['definitions']
        });

        if (!completeEntry) {
            throw new InternalServerErrorException('Failed to retrieve updated entry');
        }

        return EntryMapper.toDto(completeEntry);

    } catch (error) {
        await queryRunner.rollbackTransaction();
        if (error instanceof NotFoundException || error instanceof ConflictException) {
            throw error;
        }
        console.error(`Error updating Entry ${id}:`, error);
        throw new InternalServerErrorException(
            'Failed to update Entry. Please try again later.'
        );
    } finally {
        await queryRunner.release();
    }
}
    async delete(id: number): Promise<void> {
        const queryRunner = this.entryRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const existingEntry = await queryRunner.manager.findOne(Entry, { 
                where: { id },
                relations: ['definitions']
            });
            
            if (!existingEntry) {
                throw new NotFoundException(`Entry with ID ${id} not found`);
            }

            if (existingEntry.definitions && existingEntry.definitions.length > 0) {
                await queryRunner.manager.delete(Definition, 
                    existingEntry.definitions.map(def => def.id)
                );
            }

            await queryRunner.manager.delete(Entry, id);
            await queryRunner.commitTransaction();

        } catch (error) {
            await queryRunner.rollbackTransaction();
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error(`Error deleting Entry ${id}:`, error);
            throw new InternalServerErrorException(
                'Failed to delete Entry. Please try again later.'
            );
        } finally {
            await queryRunner.release();
        }
    }

    async getChildren(id: number, paginationDto?: PaginationDto): Promise<PaginationResultDto<ResponseEntryDto>> {
        try {
            const page = paginationDto?.page || 1;
            const limit = paginationDto?.limit || 50;
            const skip = (page - 1) * limit;

            const [children, total] = await this.entryRepository.findAndCount({
                where: { parent: { id } },
                relations: ['parent', 'definitions'], 
                skip: skip,
                take: limit,
                order: { id: 'ASC' }
            });

            const data = EntryMapper.toDtoArray(children);

            return {
                data,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            };
        } catch (error) {
            console.error(`Error getting children for entry ${id}:`, error);
            throw new InternalServerErrorException(
                'Failed to get children entries. Please try again later.'
            );
        }
    }

    async getParent(id: number): Promise<ResponseEntryDto> {
        try {
            const entry = await this.entryRepository.findOne({
                where: { id },
                relations: ['parent', 'parent.definitions'] 
            });

            if (!entry) {
                throw new NotFoundException(`Entry with ID ${id} not found`);
            }

            if (!entry.parent) {
                throw new NotFoundException(`Entry with ID ${id} has no parent`);
            }

            return EntryMapper.toDto(entry.parent);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error(`Error getting parent for entry ${id}:`, error);
            throw new InternalServerErrorException(
                'Failed to get parent entry. Please try again later.'
            );
        }
    }

    async addChild(entryDto: CreateEntryDto, parentId: number): Promise<ResponseEntryDto> {
        const queryRunner = this.entryRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const parent = await queryRunner.manager.findOne(Entry, {
                where: { id: parentId },
                relations: ['dictionary']
            });

            if (!parent) {
                throw new NotFoundException(`Parent entry with ID ${parentId} not found`);
            }

            const child = EntryMapper.toEntity(entryDto);
            child.isParent = false;
            child.isChild = true;
            child.parent = parent;
            child.dictionary = parent.dictionary;
            
            parent.isParent = true;

            const savedChild = await queryRunner.manager.save(Entry, child);
            await queryRunner.manager.save(Entry, parent);

            if (entryDto.definitions && entryDto.definitions.length > 0) {
                const definitions = entryDto.definitions.map(definitionDto => {
                    const definition = new Definition();
                    definition.entry = savedChild;
                    definition.defText = definitionDto.defText;
                    definition.senseNumber = definitionDto.senseNumber;
                    definition.etymology = definitionDto.etymology;
                    definition.remarks = definitionDto.remarks;
                    definition.ontologicalClassification = definitionDto.ontologicalClassification;
                    definition.wordClass = definitionDto.wordClass;
                    return definition;
                });

                await queryRunner.manager.save(Definition, definitions);
            }

            await queryRunner.commitTransaction();
            const completeChild = await this.entryRepository.findOne({
                where: { id: savedChild.id },
                relations: ['definitions']
            });

            if(completeChild) return EntryMapper.toDto(completeChild);
            throw new NotImplementedException();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error('Error adding child entry:', error);
            throw new InternalServerErrorException(
                'Failed to add child entry. Please try again later.'
            );
        } finally {
            await queryRunner.release();
        }
    }

    async deleteChild(childId: number): Promise<ResponseEntryDto> {
        const queryRunner = this.entryRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const child = await queryRunner.manager.findOne(Entry, {
                where: { id: childId },
                relations: ['parent', 'definitions']
            });

            if (!child) {
                throw new NotFoundException(`Child entry with ID ${childId} not found`);
            }

            const parent = child.parent;
            const childDto = EntryMapper.toDto(child);

            if (child.definitions && child.definitions.length > 0) {
                await queryRunner.manager.delete(Definition, 
                    child.definitions.map(def => def.id)
                );
            }

            if (child.isParent) {
                const children = await queryRunner.manager.find(Entry, {
                    where: { parent: { id: childId } }
                });

                for (const subChild of children) {
                    await this.deleteChild(subChild.id);
                }
            }

            await queryRunner.manager.delete(Entry, childId);

            if (parent) {
                const siblingCount = await queryRunner.manager.count(Entry, {
                    where: { parent: { id: parent.id } }
                });

                if (siblingCount === 0) {
                    parent.isParent = false;
                    await queryRunner.manager.save(Entry, parent);
                }
            }

            await queryRunner.commitTransaction();
            return childDto;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error(`Error deleting child entry ${childId}:`, error);
            throw new InternalServerErrorException(
                'Failed to delete child entry. Please try again later.'
            );
        } finally {
            await queryRunner.release();
        }
    }
}
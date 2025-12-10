import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNumber } from 'class-validator';
import { CreateDefinitionDto } from 'src/application/common/dto/definition/create-definition.dto';
import { ResponseDefinitionDto } from 'src/application/common/dto/definition/response-definition.dto';
import { UpdateDefinitionDto } from 'src/application/common/dto/definition/update-definition.dto';
import { DefinitionMapper } from 'src/application/common/mapper/definition.mapper';
import { Definition } from 'src/core/entities/definition.entity';
import { Entry } from 'src/core/entities/entry.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DefinitionService {

    constructor(
        @InjectRepository(Definition) private definitionRepository: Repository<Definition>,
        @InjectRepository(Entry) private entryRepository: Repository<Entry>
    ){}
    
       async create(definitionDto: CreateDefinitionDto): Promise<ResponseDefinitionDto> {
            try {
                const entryId = definitionDto.id;
                
                const existingEntry = await this.entryRepository.findOne({ 
                    where: { id: entryId },
                    relations: ['definitions'] 
                });
                
                if (!existingEntry) {
                    throw new NotFoundException('Entry not found');
                }

                const defEntity = DefinitionMapper.toEntity(definitionDto);
                
                const savedDefinition = await this.definitionRepository.save(defEntity);
                
                if (!existingEntry.definitions) {
                    existingEntry.definitions = [];
                }
                existingEntry.definitions.push(savedDefinition);
                
                await this.entryRepository.save(existingEntry);
                
                return DefinitionMapper.toDto(savedDefinition);
                
            } catch (error) {
                if (error instanceof NotFoundException) {
                    throw error;
                }
                throw new NotFoundException('Error creating definition');
            }
        }
           async update(id: number, updateDto: UpdateDefinitionDto): Promise<ResponseDefinitionDto> {
                try {
                    const existingDef = await this.definitionRepository.findOne({ 
                        where: { id } 
                    });
                    
                    if (!existingDef) {
                        throw new NotFoundException(`Definition with ID ${id} not found`);
                    }
        
                    const updatedEntity = this.definitionRepository.merge(
                        existingDef,
                        DefinitionMapper.partialToEntity(updateDto)
                    );
        
                    if (updatedEntity['updatedAt'] !== undefined) {
                        updatedEntity['updatedAt'] = new Date();
                    }
        
                    const savedEntity = await this.definitionRepository.save(updatedEntity);
                    return DefinitionMapper.toDto(savedEntity);
        
                } catch (error) {
                    if (error instanceof NotFoundException || error instanceof ConflictException) {
                        throw error;
                    }
                    console.error(`Error updating definition ${id}:`, error);
                    throw new InternalServerErrorException(
                        'Failed to update definition. Please try again later.'
                    );
                }
            }


       async delete(id: number): Promise<void> {
            try {
                const existingDefinition = await this.definitionRepository.findOne({ 
                    where: { id },
                    select: ['id', 'entry']
                });
                
                if (!existingDefinition) {
                    throw new NotFoundException(`Definition with ID ${id} not found`);
                }

                const entryId = existingDefinition.entry?.id;

                const deleteResult = await this.definitionRepository.delete(id);
                
                if (deleteResult.affected === 0) {
                    throw new InternalServerErrorException(
                        'Definition could not be deleted'
                    );
                }
                if (entryId) {
                    await this.entryRepository.createQueryBuilder()
                        .relation(Entry, "definitions")
                        .of(entryId)
                        .remove(id);
                }

            } catch (error) {
                if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
                    throw error;
                }
                console.error(`Error deleting Definition ${id}:`, error);
                throw new InternalServerErrorException(
                    'Failed to delete Definition. Please try again later.'
                );
            }
        }
    

}

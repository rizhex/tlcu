// src/core/entities/definition.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Entry } from './entry.entity';
import { PartOfSpeech } from '../common/part-of-speech.enum';
import { IsOptional } from 'class-validator';

@Entity()
export class Definition {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  defText: string;

 @Column({ type: 'integer', default: 1 })
  senseNumber: number;

  @Column()
  etymology: string;

  @Column()
  remarks: string = "";
  
  @Column()
  wordClass:string = "";
  
  @Column()
  ontologicalClassification: string = "";

  @ManyToOne(() => Entry, (entry) => entry.definitions)
  entry: Entry;

}
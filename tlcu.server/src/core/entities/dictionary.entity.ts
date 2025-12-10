import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Entry } from './entry.entity';
import { Author } from './author.entity';

@Entity()
export class Dictionary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  title: string;

  @Column()
  fullTitle: string;

  @Column()
  author: string;

  @Column()
  originalDate: string;

  @Column()
  century: string;

  @Column()
  publishingPlace: string;

  @Column()
  publisher: string;

  @Column()
  publishingDate: string;

  @Column()
  edition: string;

  @Column()
  sourceName: string;

  @Column()
  remarks: string;

  @Column()
  projectName: string;

  @Column()
  transcriber: string;

  @Column()
  transcriptionDate: string;

  @Column()
  revisorName: string;

  @Column()
  revisionDate: string;

  @Column()
  prologueName: string;

  @OneToMany(() => Author, (author) => author.dictionary)
  authors: Author[];

  @OneToMany(() => Entry, (entry) => entry.dictionary, { cascade: true, onDelete: 'CASCADE' })
  entries: Entry[];
}
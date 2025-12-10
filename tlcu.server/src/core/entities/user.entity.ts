// src/users/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import UserRole from '../common/user-role.enum';


@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid') // Puedes usar 'increment' si prefieres IDs numéricos
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false }) 
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.EDITOR 
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  hasEditorAccess(): boolean {
    return this.isAdmin() || this.role === UserRole.EDITOR;
  }
}
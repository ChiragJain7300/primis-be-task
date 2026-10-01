import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class User {
  @ApiProperty({ example: 1, description: 'Unique primary identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'John', description: 'First name of the user' })
  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  first_name: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the user' })
  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  last_name: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Unique email address' })
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  @Exclude({ toPlainOnly: true })
  password: string;

  @ApiProperty({ example: '2026-10-01T20:00:00.000Z', description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ApiProperty({ example: '2026-10-01T20:00:00.000Z', description: 'Last modification timestamp' })
  @UpdateDateColumn({ name: 'modified_at' })
  modified_at: Date;

  @ApiProperty({ example: null, description: 'Soft deletion timestamp', nullable: true })
  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleted_at: Date | null;
}

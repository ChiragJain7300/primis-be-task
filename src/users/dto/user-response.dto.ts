import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'John' })
  first_name: string;

  @ApiProperty({ example: 'Doe' })
  last_name: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ example: '2026-10-01T20:00:00.000Z' })
  created_at: Date;

  @ApiProperty({ example: '2026-10-01T20:00:00.000Z' })
  modified_at: Date;

  @ApiProperty({ example: null, nullable: true })
  deleted_at: Date | null;

  constructor(user: Partial<User>) {
    this.id = user.id!;
    this.first_name = user.first_name!;
    this.last_name = user.last_name!;
    this.email = user.email!;
    this.created_at = user.created_at!;
    this.modified_at = user.modified_at!;
    this.deleted_at = user.deleted_at ?? null;
  }
}

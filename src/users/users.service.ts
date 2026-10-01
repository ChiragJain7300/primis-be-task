import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Create a new user with hashed password
   */
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
      withDeleted: true,
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(newUser);
    return new UserResponseDto(savedUser);
  }

  /**
   * List all active users (excluding soft-deleted)
   */
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find();
    return users.map((user) => new UserResponseDto(user));
  }

  /**
   * Find a user by ID
   */
  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return new UserResponseDto(user);
  }

  /**
   * Internal method to find user entity by email (including password for Auth)
   */
  async findByEmailForAuth(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  /**
   * Update user details (HttpMethod POST/PATCH supported)
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email address is already in use by another account');
      }
      user.email = updateUserDto.email;
    }

    if (updateUserDto.first_name !== undefined) {
      user.first_name = updateUserDto.first_name;
    }

    if (updateUserDto.last_name !== undefined) {
      user.last_name = updateUserDto.last_name;
    }

    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.userRepository.save(user);
    return new UserResponseDto(updatedUser);
  }

  /**
   * Soft delete user (sets deleted_at timestamp using TypeORM softDelete)
   */
  async softDelete(id: number): Promise<{ message: string; id: number }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found or already deleted`);
    }

    await this.userRepository.softDelete(id);
    return {
      message: `User with ID ${id} soft-deleted successfully`,
      id,
    };
  }

  /**
   * Hard delete user (permanently removes record from database)
   */
  async hardDelete(id: number): Promise<{ message: string; id: number }> {
    const user = await this.userRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepository.delete(id);
    return {
      message: `User with ID ${id} hard-deleted permanently`,
      id,
    };
  }
}

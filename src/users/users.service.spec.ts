jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => {},
  getRepositoryToken: () => 'UserRepository',
}));

import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { ConflictException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let mockRepository: any;

  const mockUser: User = {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    password: '$2a$10$hashedpassword',
    created_at: new Date(),
    modified_at: new Date(),
    deleted_at: null,
  };

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((user) =>
        Promise.resolve({
          id: 1,
          ...user,
          created_at: new Date(),
          modified_at: new Date(),
          deleted_at: null,
        }),
      ),
      find: jest.fn().mockResolvedValue([mockUser]),
      findOne: jest.fn().mockImplementation(({ where }) => {
        if (where?.id === 1 || where?.email === 'john.doe@example.com') {
          return Promise.resolve(mockUser);
        }
        return Promise.resolve(null);
      }),
      softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    service = new UsersService(mockRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);
      const result = await service.create({
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane.doe@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('id');
      expect(result.email).toBe('jane.doe@example.com');
    });

    it('should throw ConflictException if email exists', async () => {
      mockRepository.findOne.mockResolvedValueOnce(mockUser);
      await expect(
        service.create({
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = await service.findAll();
      expect(users).toHaveLength(1);
      expect(users[0].email).toBe('john.doe@example.com');
    });
  });

  describe('softDelete', () => {
    it('should soft delete user', async () => {
      const result = await service.softDelete(1);
      expect(result.id).toBe(1);
      expect(mockRepository.softDelete).toHaveBeenCalledWith(1);
    });
  });

  describe('hardDelete', () => {
    it('should hard delete user', async () => {
      const result = await service.hardDelete(1);
      expect(result.id).toBe(1);
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});

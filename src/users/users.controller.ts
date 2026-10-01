import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create user (HttpMethod POST)' })
  @ApiResponse({ status: 201, description: 'User created successfully', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation error' })
  @ApiResponse({ status: 409, description: 'Conflict - Email already exists' })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List users (HttpMethod GET) [Jwt Bearer Auth]' })
  @ApiResponse({ status: 200, description: 'List of all active users', type: [UserResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized - Missing or invalid Jwt token' })
  async findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID (HttpMethod GET) [Jwt Bearer Auth]' })
  @ApiParam({ name: 'id', description: 'User ID', example: 1 })
  @ApiResponse({ status: 200, description: 'User details', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user method (HttpMethod PATCH) [Jwt Bearer Auth]' })
  @ApiParam({ name: 'id', description: 'User ID', example: 1 })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updatePatch(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Post(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user method (HttpMethod POST) [Jwt Bearer Auth]' })
  @ApiParam({ name: 'id', description: 'User ID', example: 1 })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id/soft')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft Delete user method (HttpMethod DELETE /users/:id/soft) [Jwt Bearer Auth]' })
  @ApiParam({ name: 'id', description: 'User ID to soft delete', example: 1 })
  @ApiResponse({ status: 200, description: 'User soft-deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async softDeleteExplicit(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.softDelete(id);
  }

  @Delete(':id/hard')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hard Delete user method (HttpMethod DELETE /users/:id/hard) [Jwt Bearer Auth]' })
  @ApiParam({ name: 'id', description: 'User ID to hard delete', example: 1 })
  @ApiResponse({ status: 200, description: 'User hard-deleted permanently' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async hardDelete(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.hardDelete(id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft Delete user default method (HttpMethod DELETE /users/:id) [Jwt Bearer Auth]' })
  @ApiParam({ name: 'id', description: 'User ID', example: 1 })
  @ApiQuery({ name: 'type', required: false, description: 'Delete type: "soft" (default) or "hard"', example: 'soft' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async softDelete(
    @Param('id', ParseIntPipe) id: number,
    @Query('type') type?: string,
  ) {
    if (type === 'hard') {
      return this.usersService.hardDelete(id);
    }
    return this.usersService.softDelete(id);
  }
}

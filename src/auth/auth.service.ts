import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { JoseJwtService } from '../common/services/jose-jwt.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly joseJwtService: JoseJwtService,
  ) {}

  /**
   * Validates user credentials and generates JWT token via Jose
   */
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findByEmailForAuth(loginDto.email);

    if (!user || user.deleted_at !== null) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokenPayload = {
      sub: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
    };

    const accessToken = await this.joseJwtService.generateToken(tokenPayload);

    return {
      access_token: accessToken,
      user: new UserResponseDto(user),
    };
  }

  /**
   * Returns current user based on JWT Token claims
   */
  async getCurrentUser(userId: number): Promise<UserResponseDto> {
    return this.usersService.findOne(userId);
  }
}

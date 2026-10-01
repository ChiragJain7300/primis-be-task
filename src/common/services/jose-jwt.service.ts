import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SignJWT, jwtVerify } from 'jose';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JoseJwtService {
  private readonly secretKey: Uint8Array;
  private readonly expiresIn: string;

  constructor(private readonly configService: ConfigService) {
    const secret = this.configService.get<string>(
      'JWT_SECRET',
      'super_secret_jwt_key_primis_task_2026_change_in_prod',
    );
    this.secretKey = new TextEncoder().encode(secret);
    this.expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '24h');
  }

  /**
   * Generates a JWT token using Jose library
   */
  async generateToken(payload: JwtPayload): Promise<string> {
    return new SignJWT({
      email: payload.email,
      first_name: payload.first_name,
      last_name: payload.last_name,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(String(payload.sub))
      .setIssuedAt()
      .setExpirationTime(this.expiresIn)
      .sign(this.secretKey);
  }

  /**
   * Verifies and decodes a JWT token using Jose library
   */
  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      const { payload } = await jwtVerify(token, this.secretKey, {
        algorithms: ['HS256'],
      });
      return {
        sub: Number(payload.sub),
        email: payload.email as string,
        first_name: payload.first_name as string,
        last_name: payload.last_name as string,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired JWT token');
    }
  }
}

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JoseJwtService } from '../common/services/jose-jwt.service';
import { JwtJoseGuard } from '../common/guards/jwt-jose.guard';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    JoseJwtService,
    {
      provide: APP_GUARD,
      useClass: JwtJoseGuard,
    },
  ],
  exports: [AuthService, JoseJwtService],
})
export class AuthModule {}

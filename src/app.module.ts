import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const dbType = configService.get<string>('DB_TYPE', 'mysql');

        if (dbType === 'sqlite' || dbType === 'better-sqlite3') {
          return {
            type: 'better-sqlite3',
            database: 'database.sqlite',
            entities: [User],
            synchronize: true,
          } as unknown as TypeOrmModuleOptions;
        }

        return {
          type: 'mysql',
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 3306),
          username: configService.get<string>('DB_USERNAME', 'root'),
          password: configService.get<string>('DB_PASSWORD', 'root'),
          database: configService.get<string>('DB_DATABASE', 'primis_auth_db'),
          entities: [User],
          synchronize: configService.get<boolean>('DB_SYNCHRONIZE', true),
        } as unknown as TypeOrmModuleOptions;
      },
    }),
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}

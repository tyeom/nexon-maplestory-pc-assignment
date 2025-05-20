import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { join } from 'path';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from '@app/common/filter';
import { AuthenticationModule } from './authentication/authentication.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: join(process.cwd(), 'apps', 'auth', '.env'),
      isGlobal: true,
      validationSchema: Joi.object({
        DB_URI: Joi.string().required(),
        HASH_ROUNDS: Joi.number().required(),
        JWT_SECRET_KEY: Joi.string().required(),
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          uri: configService.get<string>('DB_URI'),
          dbName: 'Event-Reward',
        };
      },
      inject: [ConfigService],
    }),
    UserModule,
    AuthenticationModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AuthModule {}

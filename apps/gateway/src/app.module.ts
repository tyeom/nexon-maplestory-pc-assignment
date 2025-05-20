import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AuthenticationModule } from './authentication/authentication.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  AllExceptionsFilter,
  AUTH_SERVICE,
  AUTH_SERVICE_QUEUE_NAME,
  EVENT_SERVICE,
  EVENT_SERVICE_QUEUE_NAME,
} from '@app/common';
import { UserModule } from './user/user.module';
import { join } from 'path';
import * as Joi from 'joi';
import { APP_FILTER } from '@nestjs/core';
import { EventModule } from './event/event.module';
import { RewardModule } from './reward/reward.module';
import { RewardClaimModule } from './reward-claim/reward-claim.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: join(process.cwd(), 'apps', 'gateway', '.env'),
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_SECRET_KEY: Joi.string().required(),
      }),
    }),
    AuthenticationModule,
    UserModule,

    ClientsModule.registerAsync({
      clients: [
        {
          name: AUTH_SERVICE,
          useFactory: (configService: ConfigService) => ({
            transport: Transport.RMQ,
            options: {
              urls: ['amqp://rabbitmq:5672'],
              queue: AUTH_SERVICE_QUEUE_NAME,
              queueOptions: {
                durable: true,
              },
            },
          }),
          inject: [ConfigService],
        },
        {
          name: EVENT_SERVICE,
          useFactory: (configService: ConfigService) => ({
            transport: Transport.RMQ,
            options: {
              urls: ['amqp://rabbitmq:5672'],
              queue: EVENT_SERVICE_QUEUE_NAME,
              queueOptions: {
                durable: true,
              },
            },
          }),
          inject: [ConfigService],
        },
      ],
      isGlobal: true,
    }),

    EventModule,

    RewardModule,

    RewardClaimModule,
  ],

  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class GatewayModule {}

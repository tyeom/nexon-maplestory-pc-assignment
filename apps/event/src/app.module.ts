import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { RewardModule } from './reward/reward.module';
import { RewardClaimModule } from './reward-claim/reward-claim.module';
import { EventProcessModule } from './event-process/event-process.module';
import { join } from 'path';
import * as Joi from 'joi';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_FILTER } from '@nestjs/core';
import {
  AllExceptionsFilter,
  AUTH_SERVICE,
  AUTH_SERVICE_QUEUE_NAME,
} from '@app/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EventAttendanceModule } from './event-attendance/event-attendance.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: join(process.cwd(), 'apps', 'auth', '.env'),
      isGlobal: true,
      validationSchema: Joi.object({
        DB_URI: Joi.string().required(),
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
      ],
      isGlobal: true,
    }),
    
    RewardModule,
    RewardClaimModule,
    EventProcessModule,
    EventAttendanceModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class EventModule {}

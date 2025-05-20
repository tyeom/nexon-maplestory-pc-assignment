import { NestFactory } from '@nestjs/core';
import { AuthModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AUTH_SERVICE_QUEUE_NAME } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://rabbitmq:5672'],
      queue: AUTH_SERVICE_QUEUE_NAME,
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.init();
  await app.startAllMicroservices();
}
bootstrap();

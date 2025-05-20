import { NestFactory } from '@nestjs/core';
import { EventModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { EVENT_SERVICE_QUEUE_NAME } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(EventModule);

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
      queue: EVENT_SERVICE_QUEUE_NAME,
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.init();
  await app.startAllMicroservices();
}
bootstrap();

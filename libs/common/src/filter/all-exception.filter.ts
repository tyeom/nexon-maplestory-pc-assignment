import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly configService: ConfigService) {}
  catch(exception: any, host: ArgumentsHost) {
    const isHttp = host.getType() === 'http';
    const isRpc = host.getType() === 'rpc';

    if (isHttp) {
      const ctx = host.switchToHttp();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response = ctx.getResponse();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const request = ctx.getRequest();

      const status =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;

      // HttpException에서 상세 오류 메시지 추출
      const exceptionResponse =
        exception instanceof HttpException ? exception.getResponse() : null;

      let message = 'Internal server error';

      if (exceptionResponse && typeof exceptionResponse === 'object') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const res = exceptionResponse as any;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (Array.isArray(res.message)) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          message = res.message;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        } else if (typeof res.message === 'string') {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          message = res.message;
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      } else if (exception.message) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        message = exception.message;
      }

      console.error(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        `[Global Exception] ${request.method} ${request.url} => ${exception.toString()}`,
        exception,
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      response.status(status).json({
        success: false,
        statusCode: status,
        message: message,
        timestamp: new Date().toISOString(),
      });
    }

    if (isRpc) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      console.error(`[Global RpcException] ${exception.toString()}`, exception);

      return throwError(
        () =>
          new RpcException({
            success: false,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            message: exception.message,
            timestamp: new Date().toISOString(),
          }),
      );
    }
  }
}

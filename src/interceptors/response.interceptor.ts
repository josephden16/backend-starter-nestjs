import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ZodValidationException } from 'nestjs-zod';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((res: unknown) => this.responseHandler(res, context)),
      catchError((err: HttpException) =>
        throwError(() => this.errorHandler(err, context)),
      ),
    );
  }

  errorHandler(exception: HttpException, context: ExecutionContext) {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Unhandled Exception';

    const errors: unknown = null;

    if (exception instanceof Error) {
      message = exception.message;
    }

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }

    if (exception instanceof ZodValidationException) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: 'Validation Error',
        data: null,
        errors: (exception.getResponse() as { errors: unknown }).errors,
      });
    }

    response.status(status).json({ status, message, data: null, errors });
  }

  responseHandler(res: unknown, context: ExecutionContext) {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    const status = response.statusCode;

    let message = 'success';
    let data: unknown = null;

    if (typeof res === 'object' && res) {
      if ('message' in res && typeof res.message === 'string') {
        message = res.message;

        delete res.message;
      }

      if ('data' in res) {
        data = res.data;
      }
    }

    return { status, message, data };
  }
}

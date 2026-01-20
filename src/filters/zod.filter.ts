import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';

@Catch(ZodValidationException)
export class ZodFilter implements ExceptionFilter {
  catch(exception: ZodValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = 400;
    type HasGetZod = { getZodError?: () => ZodError };
    const zodError = (exception as unknown as HasGetZod).getZodError?.();
    const issues = (zodError && zodError.issues) || [];
    response.status(status).json({
      statusCode: status,
      message: 'Invalid request',
      errors: issues,
    });
  }
}

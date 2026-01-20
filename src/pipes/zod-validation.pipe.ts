import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ZodError, ZodType } from 'zod';

@Injectable()
export class ZodValidationPipe<T = unknown> implements PipeTransform {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = this.formatZodErrors(error);
        throw new BadRequestException({
          message: 'Invalid or incomplete details sent',
          errors: formattedErrors,
        });
      }
      throw error;
    }
  }

  private formatZodErrors(error: ZodError) {
    return error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
  }
}

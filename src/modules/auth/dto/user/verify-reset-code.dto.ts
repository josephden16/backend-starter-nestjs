import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const VerifyResetCodeSchema = z.object({
  email: z.email('Invalid email format').describe('User email address'),
  code: z
    .string()
    .length(6, 'Reset code must be 6 digits')
    .regex(/^\d{6}$/, 'Reset code must contain only digits')
    .describe('6-digit reset code'),
});

export class VerifyResetCodeDto extends createZodDto(VerifyResetCodeSchema) {}

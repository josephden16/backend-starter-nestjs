import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const VerifyEmailSchema = z.object({
  email: z.email('Invalid email format').describe('User email address'),
  code: z
    .string()
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d{6}$/, 'Verification code must contain only digits')
    .describe('6-digit verification code'),
});

export class VerifyEmailDto extends createZodDto(VerifyEmailSchema) {}

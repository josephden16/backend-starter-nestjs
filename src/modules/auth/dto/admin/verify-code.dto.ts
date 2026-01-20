import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const VerifyCodeSchema = z.object({
  email: z.email('Invalid email format').describe('Admin email address'),
  code: z
    .string()
    .regex(/^\d{4}$/, 'Code must be 4 digits')
    .describe('Verification code'),
});

export class VerifyCodeDto extends createZodDto(VerifyCodeSchema) {}

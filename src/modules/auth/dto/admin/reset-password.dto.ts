import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const ResetPasswordSchema = z.object({
  email: z.email('Invalid email format').describe('Admin email address'),
  code: z
    .string()
    .regex(/^\d{4}$/, 'Code must be 4 digits')
    .describe('Verification code'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .describe('New password'),
});

export class AdminResetPasswordDto extends createZodDto(ResetPasswordSchema) {}

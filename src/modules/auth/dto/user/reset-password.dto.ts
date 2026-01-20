import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const ResetPasswordSchema = z.object({
  resetToken: z
    .string()
    .min(1, 'Reset token is required')
    .describe('Reset token from code verification'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .describe('New password'),
});

export class UserResetPasswordDto extends createZodDto(ResetPasswordSchema) {}

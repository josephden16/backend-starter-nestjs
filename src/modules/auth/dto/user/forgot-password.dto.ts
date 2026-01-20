import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const ForgotPasswordSchema = z.object({
  email: z.email('Invalid email format').describe('User email address'),
});

export class UserForgotPasswordDto extends createZodDto(ForgotPasswordSchema) {}

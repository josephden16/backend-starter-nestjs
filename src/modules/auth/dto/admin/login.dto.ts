import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.email('Invalid email format').describe('Admin email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .describe('Admin password'),
});

export class AdminLoginDto extends createZodDto(LoginSchema) {}

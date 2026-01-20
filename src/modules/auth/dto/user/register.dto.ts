import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const RegisterSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .describe('User first name'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .describe('User last name'),
  email: z.email('Invalid email format').describe('User email address'),
  phoneNumber: z
    .string()
    .regex(/^\d{10,}$/, 'Phone number must be at least 10 digits')
    .describe('User phone number'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .describe('User password'),
});

export class RegisterDto extends createZodDto(RegisterSchema) {}

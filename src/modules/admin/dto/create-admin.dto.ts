import { AdminRole } from 'generated/prisma';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateAdminSchema = z.object({
  email: z.email('Invalid email format').describe('Admin email address'),
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .describe('Admin first name'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .describe('Admin last name'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .describe('Admin password'),
  role: z
    .enum(AdminRole)
    .optional()
    .default(AdminRole.ADMIN)
    .describe('Admin role'),
});

export class CreateAdminDto extends createZodDto(CreateAdminSchema) {}

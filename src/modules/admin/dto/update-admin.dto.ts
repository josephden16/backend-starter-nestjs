import { AdminRole } from 'generated/prisma';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const UpdateAdminSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .optional()
    .describe('Admin first name'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .optional()
    .describe('Admin last name'),
  role: z.enum(AdminRole).optional().describe('Admin role'),
});

export class UpdateAdminDto extends createZodDto(UpdateAdminSchema) {}

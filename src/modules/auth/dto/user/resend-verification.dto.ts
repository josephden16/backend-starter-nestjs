import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const ResendVerificationSchema = z.object({
  email: z.email('Invalid email format').describe('User email address'),
});

export class ResendVerificationDto extends createZodDto(
  ResendVerificationSchema,
) {}

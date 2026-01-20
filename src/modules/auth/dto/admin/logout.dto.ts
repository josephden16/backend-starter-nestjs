import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const LogoutSchema = z.object({
  refreshToken: z
    .string()
    .optional()
    .describe('Refresh token to invalidate (optional)'),
});

export class LogoutDto extends createZodDto(LogoutSchema) {}

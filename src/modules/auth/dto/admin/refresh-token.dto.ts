import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const RefreshTokenSchema = z.object({
  refreshToken: z.string().describe('Refresh token from login response'),
});

export class AdminRefreshTokenDto extends createZodDto(RefreshTokenSchema) {}

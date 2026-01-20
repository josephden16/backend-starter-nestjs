import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const RefreshTokenSchema = z.object({
  refreshToken: z.string().describe('Refresh token'),
});

export class UserRefreshTokenDto extends createZodDto(RefreshTokenSchema) {}

import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const UserLogoutSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export class UserLogoutDto extends createZodDto(UserLogoutSchema) {}

import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const DeviceInfoSchema = z.object({
  deviceName: z.string().min(1).max(100).optional(),
  deviceType: z.enum(['ios', 'android', 'web']),
  deviceModel: z.string().max(100).optional(),
  osVersion: z.string().max(50).optional(),
  appVersion: z.string().max(50).optional(),
  deviceFingerprint: z.string().max(500).optional(),
});

const LoginSchema = z.object({
  email: z.email('Invalid email format').describe('User email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .describe('User password'),
  deviceInfo: DeviceInfoSchema.optional().describe(
    'Optional device information for device token registration',
  ),
});

export class UserLoginDto extends createZodDto(LoginSchema) {}

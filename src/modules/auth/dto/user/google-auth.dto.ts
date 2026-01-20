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

const GoogleAuthSchema = z.object({
  idToken: z
    .string()
    .describe('Google OAuth ID token from client-side authentication'),
  deviceInfo: DeviceInfoSchema.optional().describe(
    'Optional device information for device token registration',
  ),
});

export class GoogleAuthDto extends createZodDto(GoogleAuthSchema) {}

import { createZodDto } from 'nestjs-zod';
import {
  NOTIFICATIONS_DEFAULT_LIMIT,
  NOTIFICATIONS_MAX_LIMIT,
} from 'src/constants';
import { z } from 'zod';

const ListNotificationsQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .default(String(NOTIFICATIONS_DEFAULT_LIMIT))
    .transform((value) => parseInt(value, 10))
    .pipe(
      z
        .number()
        .int()
        .positive()
        .max(NOTIFICATIONS_MAX_LIMIT, 'Limit exceeds maximum allowed value'),
    ),
  offset: z
    .string()
    .optional()
    .default('0')
    .transform((value) => parseInt(value, 10))
    .pipe(z.number().int().min(0, 'Offset must be zero or positive')),
});

export class ListNotificationsQueryDto extends createZodDto(
  ListNotificationsQuerySchema,
) {}

export type ListNotificationsQuery = z.infer<
  typeof ListNotificationsQuerySchema
>;

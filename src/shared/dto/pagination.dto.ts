import { createZodDto } from 'nestjs-zod';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from 'src/constants';
import { z } from 'zod';

const PaginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default(String(DEFAULT_PAGE))
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, { message: 'Page must be greater than 0' })
    .describe('Page number'),
  limit: z
    .string()
    .optional()
    .default(String(DEFAULT_LIMIT))
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 100, {
      message: 'Limit must be between 1 and 100',
    })
    .describe('Number of items per page'),
  search: z.string().optional().default('').describe('Search query'),
});

export class PaginationQueryDto extends createZodDto(PaginationQuerySchema) {}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

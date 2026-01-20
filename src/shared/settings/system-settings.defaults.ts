import { Prisma } from 'generated/prisma';

/**
 * Default system settings values used across the application.
 * This ensures consistency when creating new settings records.
 */
export const DEFAULT_SYSTEM_SETTINGS: Prisma.SystemSettingsCreateInput = {
  // Email settings
  allowedEmailExtensions: [
    'gmail.com',
    'yahoo.com',
    'outlook.com',
    'icloud.com',
    'protonmail.com',
    'zoho.com',
  ],
};

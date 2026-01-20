import { Prisma } from 'generated/prisma';
import { WEBSITE_INVITE_URL } from 'src/constants';

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

  // Job reporting settings
  allowUsersToReport: true,
  jobSuspensionThreshold: 5,

  // Salary settings
  minimumSalaryRanges: {
    perHour: 200,
    perDay: 1000,
    perWeek: 2000,
    perMonth: 10000,
  },

  // Coin settings
  defaultSignupCoins: 10,
  dailyCheckInCoins: 10,
  coinsRequiredToApplyToJob: 10,
  coinPurchaseEnabled: true,
  lowCoinBalanceThreshold: 10,

  // Referral settings
  referralEnabled: true,
  coinsPerReferral: 50,
  referralLinkBaseUrl: WEBSITE_INVITE_URL,

  // Streak bonus settings
  streakBonusEnabled: false,
  streakBonusThreshold: 7,
  streakBonusCoins: 5,
};

/**
 * Minimum salary ranges type for type safety
 */
export interface MinimumSalaryRanges {
  perHour: number;
  perDay: number;
  perWeek: number;
  perMonth: number;
}

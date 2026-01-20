import { DEFAULT_TOKEN_EXPIRY_SECONDS } from 'src/constants';

/**
 * Parse JWT expiry time string to seconds
 * Supports: s (seconds), m (minutes), h (hours), d (days), w (weeks)
 * @param expiry - The expiry string (e.g., '7d', '24h', '30m')
 * @returns The expiry time in seconds
 */
export function parseExpiryToSeconds(expiry: string): number {
  const match = /^(\d+)([smhdw])$/i.exec(expiry);
  if (!match) {
    return DEFAULT_TOKEN_EXPIRY_SECONDS;
  }

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  const unitMultipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 60 * 60 * 24,
    w: 60 * 60 * 24 * 7,
  };

  return value * (unitMultipliers[unit] ?? DEFAULT_TOKEN_EXPIRY_SECONDS);
}


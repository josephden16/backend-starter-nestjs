import { randomInt } from 'crypto';

export * from './payment.utils';
export * from './time.utils';

export const equals = <T>(a: T, b: T) => a === b;

export const capitalize = (str: string) => {
  if (typeof str !== 'string' || str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Utility to extract enum values as tuple for Zod
export function enumValues<T extends { [key: string]: string }>(
  e: T,
): [T[keyof T], ...T[keyof T][]] {
  return Object.values(e) as [T[keyof T], ...T[keyof T][]];
}

export function generateReferralCode(): string {
  const charset =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 8; i += 1) {
    code += charset.charAt(randomInt(0, charset.length));
  }
  return code;
}

export function generateUsername(firstName: string, lastName: string): string {
  const cleanFirst = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanLast = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const randomSuffix = randomInt(1000, 9999);
  return `${cleanFirst}${cleanLast}${randomSuffix}`;
}

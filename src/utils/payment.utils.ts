import { randomBytes } from 'crypto';
import { PaymentChannel } from 'generated/prisma';

/**
 * Generate a unique payment reference with a prefix
 * @param prefix - The prefix to use (e.g., 'SUB', 'COIN')
 * @returns A unique reference string
 */
export function generatePaymentReference(prefix: string): string {
  const random = randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}-${Date.now()}-${random}`;
}

/**
 * Map payment channel string from provider to PaymentChannel enum
 * @param channel - The channel string from the payment provider
 * @returns The corresponding PaymentChannel enum value or null
 */
export function mapPaymentChannel(
  channel?: string | null,
): PaymentChannel | null {
  if (!channel) return null;

  const normalized = channel.toUpperCase();

  const channelMap: Record<string, PaymentChannel> = {
    CARD: PaymentChannel.CARD,
    BANK: PaymentChannel.BANK_ACCOUNT,
    BANK_ACCOUNT: PaymentChannel.BANK_ACCOUNT,
    BANK_TRANSFER: PaymentChannel.BANK_TRANSFER,
    USSD: PaymentChannel.USSD,
    MOBILE_MONEY: PaymentChannel.MOBILE_MONEY,
    QR: PaymentChannel.QR,
    APPLE_PAY: PaymentChannel.APPLE_PAY,
  };

  return channelMap[normalized] ?? null;
}

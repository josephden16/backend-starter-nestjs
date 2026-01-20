export enum PaymentProviderType {
  PAYSTACK = 'PAYSTACK',
  MANUAL = 'MANUAL',
}

export enum PaymentStatusCode {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  ABANDONED = 'ABANDONED',
}

export interface InitializePaymentPayload {
  email: string;
  amount: number;
  currency?: string;
  metadata?: Record<string, unknown>;
  callbackUrl?: string;
  reference?: string;
  channels?: string[];
}

export interface InitializePaymentResult {
  authorizationUrl: string;
  accessCode?: string;
  reference: string;
  providerResponse?: unknown;
}

export interface VerifyPaymentResult {
  reference: string;
  status: PaymentStatusCode;
  amount: number;
  currency: string;
  channel?: string;
  paidAt?: Date | null;
  providerReference?: string;
  providerResponse?: unknown;
}

export interface PaymentProvider {
  initializePayment(
    payload: InitializePaymentPayload,
  ): Promise<InitializePaymentResult>;
  verifyPayment(reference: string): Promise<VerifyPaymentResult>;
}

import { Injectable } from '@nestjs/common';

import {
  InitializePaymentPayload,
  InitializePaymentResult,
  PaymentProvider,
  PaymentProviderType,
  VerifyPaymentResult,
} from './payment-provider.interface';
import { PaystackProvider } from './paystack.provider';

@Injectable()
export class PaymentsService {
  private readonly providers: Record<PaymentProviderType, PaymentProvider>;

  constructor(private readonly paystackProvider: PaystackProvider) {
    this.providers = {
      [PaymentProviderType.PAYSTACK]: this.paystackProvider,
      [PaymentProviderType.MANUAL]: this.paystackProvider,
    };
  }

  private resolveProvider(provider: PaymentProviderType): PaymentProvider {
    const resolved = this.providers[provider];

    if (!resolved) {
      throw new Error(`Payment provider ${provider} is not configured`);
    }

    return resolved;
  }

  async initializePayment(
    payload: InitializePaymentPayload,
    provider: PaymentProviderType = PaymentProviderType.PAYSTACK,
  ): Promise<InitializePaymentResult> {
    const resolvedProvider = this.resolveProvider(provider);
    return resolvedProvider.initializePayment(payload);
  }

  async verifyPayment(
    reference: string,
    provider: PaymentProviderType = PaymentProviderType.PAYSTACK,
  ): Promise<VerifyPaymentResult> {
    const resolvedProvider = this.resolveProvider(provider);
    return resolvedProvider.verifyPayment(reference);
  }
}

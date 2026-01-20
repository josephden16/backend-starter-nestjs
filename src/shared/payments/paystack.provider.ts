import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { ConfigServiceType } from 'src/config';
import { CustomLogger } from 'src/shared/logger/logger.service';

import {
  InitializePaymentPayload,
  InitializePaymentResult,
  PaymentProvider,
  PaymentStatusCode,
  VerifyPaymentResult,
} from './payment-provider.interface';

interface PaystackResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

interface PaystackInitializeData {
  authorization_url: string;
  access_code: string;
  reference: string;
}

interface PaystackVerifyData {
  status: string;
  reference: string;
  amount: number;
  currency: string;
  channel?: string;
  paid_at?: string;
  gateway_response?: string;
  authorization?: {
    authorization_code?: string;
    card_type?: string;
    bank?: string;
  };
}

@Injectable()
export class PaystackProvider implements PaymentProvider {
  private readonly secretKey: string;
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<ConfigServiceType>,
    private readonly logger: CustomLogger,
  ) {
    this.secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY', '');
    this.baseUrl =
      this.configService.get<string>('PAYSTACK_BASE_URL') ||
      'https://api.paystack.co';

    if (!this.secretKey) {
      this.logger.error('Paystack secret key is not configured');
      throw new Error('PAYSTACK_SECRET_KEY is required');
    }
  }

  async initializePayment(
    payload: InitializePaymentPayload,
  ): Promise<InitializePaymentResult> {
    const url = `${this.baseUrl}/transaction/initialize`;
    try {
      const response = await firstValueFrom(
        this.httpService.post<PaystackResponse<PaystackInitializeData>>(
          url,
          {
            email: payload.email,
            amount: Math.round(payload.amount * 100),
            currency: payload.currency ?? 'NGN',
            callback_url: payload.callbackUrl,
            reference: payload.reference,
            metadata: payload.metadata,
            channels: payload.channels,
          },
          { headers: this.getHeaders() },
        ),
      );

      if (!response.data?.status) {
        throw new InternalServerErrorException(
          response.data?.message || 'Unable to initialize Paystack payment',
        );
      }

      const data = response.data.data;
      return {
        authorizationUrl: data.authorization_url,
        accessCode: data.access_code,
        reference: data.reference,
        providerResponse: response.data,
      };
    } catch (error) {
      this.handleError('initializePayment', error);
    }
  }

  async verifyPayment(reference: string): Promise<VerifyPaymentResult> {
    const url = `${this.baseUrl}/transaction/verify/${reference}`;
    try {
      const response = await firstValueFrom(
        this.httpService.get<PaystackResponse<PaystackVerifyData>>(url, {
          headers: this.getHeaders(),
        }),
      );

      if (!response.data?.status) {
        throw new InternalServerErrorException(
          response.data?.message || 'Unable to verify Paystack payment',
        );
      }

      const data = response.data.data;
      const amount = data.amount ? data.amount / 100 : 0;
      return {
        reference: data.reference,
        status: this.mapStatus(data.status),
        amount,
        currency: data.currency,
        channel: data.channel,
        paidAt: data.paid_at ? new Date(data.paid_at) : null,
        providerReference: data.authorization?.authorization_code,
        providerResponse: response.data,
      };
    } catch (error) {
      this.handleError('verifyPayment', error);
    }
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    };
  }

  private mapStatus(status: string): PaymentStatusCode {
    switch (status?.toLowerCase()) {
      case 'success':
        return PaymentStatusCode.SUCCESS;
      case 'failed':
        return PaymentStatusCode.FAILED;
      case 'abandoned':
        return PaymentStatusCode.ABANDONED;
      default:
        return PaymentStatusCode.PENDING;
    }
  }

  private handleError(context: string, error: unknown): never {
    const axiosError = error as AxiosError<{ message?: string }>;

    this.logger.error('PaystackProvider error', {
      context,
      message: axiosError.response?.data?.message || axiosError.message,
    });

    throw new InternalServerErrorException(
      axiosError.response?.data?.message || 'Payment provider error',
    );
  }
}

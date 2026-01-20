import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';

import { PaymentsService } from './payments.service';
import { PaystackProvider } from './paystack.provider';

@Global()
@Module({
  imports: [HttpModule],
  providers: [PaystackProvider, PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}

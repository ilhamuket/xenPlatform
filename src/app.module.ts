import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TransactionsModule } from './transactions/transactions.module';
import { XenditModule } from './xendit/xendit.module';
import { WebhookController } from './webhook/webhook.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TransactionsModule,
    XenditModule,
  ],
  controllers: [WebhookController],
})
export class AppModule {}

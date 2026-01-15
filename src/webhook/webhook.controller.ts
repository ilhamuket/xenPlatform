// src/webhook/webhook.controller.ts
import { Controller, Post, Req, Res, Body, Headers, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

@Controller('webhook/xendit')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private config: ConfigService) {}

  @Post()
  async handle(
    @Body() body: any,
    @Headers('x-callback-token') callbackToken: string,
    @Res() res: Response,
  ) {
    // 1. Verify webhook token
    const expectedToken = this.config.get<string>('WEBHOOK_TOKEN');
    
    if (!callbackToken || callbackToken !== expectedToken) {
      this.logger.warn('⚠️ Invalid webhook token received');
      return res.status(401).json({ error: 'Invalid token' });
    }

    // 2. Log incoming webhook
    this.logger.log('📥 Webhook received:', JSON.stringify(body, null, 2));

    try {
      // 3. Route based on webhook type
      await this.processWebhook(body);

      // 4. Always return 200 OK to Xendit (to avoid retries)
      return res.status(200).json({ received: true });
    } catch (error) {
      this.logger.error('❌ Webhook processing error:', error);
      // Still return 200 to prevent Xendit from retrying
      return res.status(200).json({ received: true, error: error.message });
    }
  }

  private async processWebhook(payload: any) {
    // Detect webhook type based on payload structure
    if (payload.external_id && payload.account_number) {
      // Virtual Account Callback
      await this.handleVirtualAccountCallback(payload);
    } else if (payload.id && payload.status && payload.invoice_url) {
      // Invoice Callback
      await this.handleInvoiceCallback(payload);
    } else if (payload.payment_request_id || payload.reference_id) {
      // Payment Request Callback
      await this.handlePaymentRequestCallback(payload);
    } else {
      this.logger.warn('⚠️ Unknown webhook type:', payload);
    }
  }

  private async handleVirtualAccountCallback(payload: any) {
    this.logger.log('💳 Processing Virtual Account callback');

    const { external_id, amount, bank_code, account_number, transaction_timestamp, status } = payload;

    if (status === 'PAID') {
      this.logger.log('✅ VA Payment SUCCESS:', {
        external_id,
        amount,
        bank_code,
        account_number,
        paid_at: transaction_timestamp,
      });

      // TODO: Update your database
      // Example:
      // await this.ordersService.markAsPaid(external_id);
      // await this.emailService.sendPaymentConfirmation(external_id);
      
    } else {
      this.logger.log(`ℹ️ VA Status: ${status}`, { external_id });
    }
  }

  private async handleInvoiceCallback(payload: any) {
    this.logger.log('🧾 Processing Invoice callback');

    const { id, external_id, status, amount, paid_amount, payment_channel, payment_method } = payload;

    switch (status) {
      case 'PAID':
        this.logger.log('✅ Invoice PAID:', {
          invoice_id: id,
          external_id,
          amount,
          paid_amount,
          payment_method,
          payment_channel,
        });

        // TODO: Update your database
        // await this.ordersService.markAsPaid(external_id);
        // await this.emailService.sendPaymentConfirmation(external_id);
        break;

      case 'EXPIRED':
        this.logger.log('⏰ Invoice EXPIRED:', { invoice_id: id, external_id });
        // TODO: Handle expired invoice
        break;

      case 'SETTLED':
        this.logger.log('💰 Invoice SETTLED:', { invoice_id: id, external_id });
        // TODO: Handle settlement
        break;

      default:
        this.logger.log(`ℹ️ Invoice Status: ${status}`, { invoice_id: id, external_id });
    }
  }

  private async handlePaymentRequestCallback(payload: any) {
    this.logger.log('💸 Processing Payment Request callback');

    const { id, reference_id, status, channel_code, payment_method } = payload;

    if (status === 'SUCCEEDED') {
      this.logger.log('✅ Payment Request SUCCESS:', {
        payment_request_id: id,
        reference_id,
        channel_code,
        payment_method,
      });

      // TODO: Update your database
      // await this.ordersService.markAsPaid(reference_id);
      
    } else {
      this.logger.log(`ℹ️ Payment Request Status: ${status}`, { reference_id });
    }
  }
}
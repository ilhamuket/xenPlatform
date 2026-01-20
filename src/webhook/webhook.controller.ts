import {
  Controller,
  Post,
  Body,
  Headers,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Controller('webhook/xendit')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly config: ConfigService) {}

  @Post()
  async handleWebhook(
    @Body() body: any,
    @Headers('x-callback-token') callbackToken: string,
    @Headers('webhook-id') webhookId: string,
    @Headers() headers: Record<string, any>,
  ) {
    // ===============================
    // 1️⃣ VERIFY CALLBACK TOKEN
    // ===============================
    const expectedToken = this.config.get<string>('WEBHOOK_TOKEN');

    if (!this.isValidToken(callbackToken, expectedToken)) {
      this.logger.warn('⚠️ Invalid Xendit webhook token');
      throw new UnauthorizedException('Invalid webhook token');
    }

    // ===============================
    // 2️⃣ LOG FULL WEBHOOK (HEADER + BODY)
    // ===============================
    this.logger.log('📥 XENDIT WEBHOOK RECEIVED');
    this.logger.debug({
      webhookId,
      headers,
      body,
    });

    // ===============================
    // 3️⃣ IDEMPOTENCY CHECK
    // ===============================
    if (await this.isWebhookProcessed(webhookId)) {
      this.logger.warn(`⚠️ Duplicate webhook ignored: ${webhookId}`);
      return { received: true };
    }

    // ===============================
    // 4️⃣ ACK CEPAT → PROSES ASYNC
    // ===============================
    setImmediate(async () => {
      try {
        await this.processWebhook(body);
        await this.markWebhookProcessed(webhookId);
      } catch (error) {
        this.logger.error('❌ Webhook async processing failed', error);
      }
    });

    // ⚠️ SELALU RETURN 200
    return { received: true };
  }

  // =========================================================
  // 🔐 TOKEN VALIDATION (TIMING SAFE)
  // =========================================================
  private isValidToken(received?: string, expected?: string): boolean {
    if (!received || !expected) return false;

    try {
      return crypto.timingSafeEqual(
        Buffer.from(received),
        Buffer.from(expected),
      );
    } catch {
      return false;
    }
  }

  // =========================================================
  // 🔁 IDEMPOTENCY (DUMMY IMPLEMENTATION)
  // =========================================================
  private async isWebhookProcessed(webhookId: string): Promise<boolean> {
    if (!webhookId) return false;

    // TODO:
    // return this.webhookRepo.exists({ webhookId });

    return false; // sementara
  }

  private async markWebhookProcessed(webhookId: string): Promise<void> {
    if (!webhookId) return;

    // TODO:
    // await this.webhookRepo.save({ webhookId, processedAt: new Date() });

    this.logger.debug(`🧾 Webhook marked as processed: ${webhookId}`);
  }

  // =========================================================
  // 🚦 WEBHOOK ROUTER
  // =========================================================
  private async processWebhook(payload: any) {
    /**
     * Xendit payload bisa beda-beda tergantung produk,
     * jadi kita deteksi secara defensif
     */

    // Virtual Account
    if (payload.account_number && payload.external_id) {
      return this.handleVirtualAccount(payload);
    }

    // Invoice
    if (payload.invoice_url && payload.status) {
      return this.handleInvoice(payload);
    }

    // Payment Request / QRIS / E-wallet
    if (payload.payment_request_id || payload.reference_id) {
      return this.handlePaymentRequest(payload);
    }

    this.logger.warn('⚠️ Unknown Xendit webhook payload', payload);
  }

  // =========================================================
  // 💳 VIRTUAL ACCOUNT
  // =========================================================
  private async handleVirtualAccount(payload: any) {
    this.logger.log('💳 Virtual Account Callback');

    const {
      external_id,
      status,
      amount,
      bank_code,
      account_number,
      transaction_timestamp,
    } = payload;

    this.logger.debug({ payload });

    if (status === 'PAID') {
      this.logger.log('✅ VA PAID', {
        external_id,
        amount,
        bank_code,
        account_number,
        paid_at: transaction_timestamp,
      });

      // TODO:
      // await this.orderService.markPaid(external_id);
    }
  }

  // =========================================================
  // 🧾 INVOICE
  // =========================================================
  private async handleInvoice(payload: any) {
    this.logger.log('🧾 Invoice Callback');

    const {
      id,
      external_id,
      status,
      amount,
      paid_amount,
      payment_method,
      payment_channel,
    } = payload;

    this.logger.debug({ payload });

    switch (status) {
      case 'PAID':
        this.logger.log('✅ INVOICE PAID', {
          invoice_id: id,
          external_id,
          amount,
          paid_amount,
          payment_method,
          payment_channel,
        });
        break;

      case 'EXPIRED':
        this.logger.log('⏰ INVOICE EXPIRED', { invoice_id: id });
        break;

      case 'SETTLED':
        this.logger.log('💰 INVOICE SETTLED', { invoice_id: id });
        break;

      default:
        this.logger.log(`ℹ️ Invoice status: ${status}`, { invoice_id: id });
    }
  }

  // =========================================================
  // 💸 PAYMENT REQUEST / QRIS / EWALLET
  // =========================================================
  private async handlePaymentRequest(payload: any) {
    this.logger.log('💸 Payment Request Callback');

    const {
      id,
      reference_id,
      status,
      channel_code,
      payment_method,
    } = payload;

    this.logger.debug({ payload });

    if (status === 'SUCCEEDED') {
      this.logger.log('✅ PAYMENT SUCCEEDED', {
        payment_request_id: id,
        reference_id,
        channel_code,
        payment_method,
      });

      // TODO:
      // await this.orderService.markPaid(reference_id);
    }
  }
}

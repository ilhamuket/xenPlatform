"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
// src/webhook/webhook.controller.ts
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let WebhookController = WebhookController_1 = class WebhookController {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(WebhookController_1.name);
    }
    async handle(body, callbackToken, res) {
        // 1. Verify webhook token
        const expectedToken = this.config.get('WEBHOOK_TOKEN');
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
        }
        catch (error) {
            this.logger.error('❌ Webhook processing error:', error);
            // Still return 200 to prevent Xendit from retrying
            return res.status(200).json({ received: true, error: error.message });
        }
    }
    async processWebhook(payload) {
        // Detect webhook type based on payload structure
        if (payload.external_id && payload.account_number) {
            // Virtual Account Callback
            await this.handleVirtualAccountCallback(payload);
        }
        else if (payload.id && payload.status && payload.invoice_url) {
            // Invoice Callback
            await this.handleInvoiceCallback(payload);
        }
        else if (payload.payment_request_id || payload.reference_id) {
            // Payment Request Callback
            await this.handlePaymentRequestCallback(payload);
        }
        else {
            this.logger.warn('⚠️ Unknown webhook type:', payload);
        }
    }
    async handleVirtualAccountCallback(payload) {
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
        }
        else {
            this.logger.log(`ℹ️ VA Status: ${status}`, { external_id });
        }
    }
    async handleInvoiceCallback(payload) {
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
    async handlePaymentRequestCallback(payload) {
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
        }
        else {
            this.logger.log(`ℹ️ Payment Request Status: ${status}`, { reference_id });
        }
    }
};
exports.WebhookController = WebhookController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-callback-token')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "handle", null);
exports.WebhookController = WebhookController = WebhookController_1 = __decorate([
    (0, common_1.Controller)('webhook/xendit'),
    __metadata("design:paramtypes", [config_1.ConfigService])
], WebhookController);
//# sourceMappingURL=webhook.controller.js.map
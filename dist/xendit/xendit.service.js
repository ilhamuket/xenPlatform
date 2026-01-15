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
Object.defineProperty(exports, "__esModule", { value: true });
exports.XenditService = void 0;
// src/xendit/xendit.service.ts
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const config_1 = require("@nestjs/config");
let XenditService = class XenditService {
    constructor(configService) {
        this.configService = configService;
        this.base = 'https://api.xendit.co';
    }
    getHeaders(forUserId) {
        const secretKey = this.configService.get('XENDIT_SECRET_KEY');
        const headers = {
            Authorization: 'Basic ' + Buffer.from(secretKey + ':').toString('base64'),
            'Content-Type': 'application/json',
        };
        if (forUserId) {
            headers['for-user-id'] = forUserId;
        }
        return headers;
    }
    // ===================== QRIS METHODS =====================
    /**
     * Create QRIS Code
     * @param amount - Amount in IDR
     * @param referenceId - Unique reference ID
     * @param channelCode - Channel code (ID_DANA, ID_LINKAJA, ID_OVO, ID_SHOPEEPAY)
     * @param forUserId - Sub-account user ID (optional)
     */
    async createQRIS(amount, referenceId, channelCode, forUserId) {
        var _a, _b;
        const url = `${this.base}/qr_codes`;
        // Set expiry 24 jam dari sekarang
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        const body = {
            external_id: referenceId,
            reference_id: referenceId,
            callback_url: 'https://calling-back.com/xendit/qris', // Add callback URL
            type: 'DYNAMIC',
            currency: 'IDR',
            amount: amount,
            channel_code: channelCode,
            expires_at: expiresAt,
        };
        console.log('📤 Creating QRIS:', JSON.stringify(body, null, 2));
        try {
            const { data } = await axios_1.default.post(url, body, {
                headers: {
                    ...this.getHeaders(forUserId),
                    'api-version': '2022-07-31',
                },
            });
            console.log('✅ QRIS Created:', {
                id: data.id,
                reference_id: data.reference_id,
                channel_code: data.channel_code,
                qr_string_length: (_a = data.qr_string) === null || _a === void 0 ? void 0 : _a.length,
                status: data.status,
            });
            return data;
        }
        catch (err) {
            console.error('❌ Xendit QRIS Error:', ((_b = err.response) === null || _b === void 0 ? void 0 : _b.data) || err.message);
            throw err;
        }
    }
    /**
     * Simulate QRIS Payment (Test Mode Only)
     * @param qrId - QR Code ID from createQRIS response
     * @param amount - Amount to simulate
     * @param forUserId - Sub-account user ID (optional)
     */
    async simulateQRISPayment(qrId, amount, forUserId) {
        var _a;
        const url = `${this.base}/qr_codes/${qrId}/payments/simulate`;
        const body = {
            amount: amount,
        };
        console.log('🎮 Simulating QRIS Payment:', {
            qr_id: qrId,
            amount: amount,
            url: url,
        });
        try {
            const { data } = await axios_1.default.post(url, body, {
                headers: {
                    ...this.getHeaders(forUserId),
                    'api-version': '2022-07-31',
                },
            });
            console.log('✅ QRIS Simulation Response:', data);
            return data;
        }
        catch (err) {
            console.error('❌ Xendit QRIS Simulation Error:', ((_a = err.response) === null || _a === void 0 ? void 0 : _a.data) || err.message);
            throw err;
        }
    }
};
exports.XenditService = XenditService;
exports.XenditService = XenditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], XenditService);
//# sourceMappingURL=xendit.service.js.map
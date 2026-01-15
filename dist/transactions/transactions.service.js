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
exports.TransactionsService = void 0;
// src/transactions/transactions.service.ts
const common_1 = require("@nestjs/common");
const xendit_service_1 = require("../xendit/xendit.service");
const companies_service_1 = require("../companies/companies.service");
const products_service_1 = require("../products/products.service");
let TransactionsService = class TransactionsService {
    constructor(xendit, companies, products) {
        this.xendit = xendit;
        this.companies = companies;
        this.products = products;
        // In-memory storage untuk mapping qrId -> forUserId
        // Dalam production, ini harus di database
        this.qrMappings = new Map();
    }
    /**
     * Create QRIS Payment
     * @param productId - Product ID
     * @param customerName - Customer name
     * @param customerEmail - Customer email
     * @param channelCode - QRIS channel (ID_DANA, ID_LINKAJA, ID_OVO, ID_SHOPEEPAY)
     */
    async createQRISPayment(productId, customerName, customerEmail, channelCode) {
        // Find product
        const product = this.products.findOne(productId);
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        // Find company
        const company = this.companies.findOne(product.companyId);
        if (!company) {
            throw new common_1.NotFoundException('Company not found');
        }
        // Generate unique reference ID
        const referenceId = `qris-${Date.now()}-${productId}`;
        console.log('🛒 Creating QRIS for:', {
            product: product.name,
            company: company.name,
            forUserId: company.forUserId,
            amount: product.price,
            channelCode,
        });
        // Create QRIS via Xendit
        const qr = await this.xendit.createQRIS(product.price, referenceId, channelCode, company.forUserId);
        // Store mapping untuk simulate payment nanti
        this.qrMappings.set(qr.id, {
            forUserId: company.forUserId,
            amount: product.price,
            productId: productId,
        });
        console.log('💾 Stored QR mapping:', {
            qrId: qr.id,
            forUserId: company.forUserId,
        });
        return {
            qr_id: qr.id,
            reference_id: qr.reference_id,
            external_id: qr.external_id,
            qr_string: qr.qr_string,
            channel_code: qr.channel_code,
            amount: qr.amount,
            currency: qr.currency,
            expires_at: qr.expires_at,
            status: qr.status,
            created: qr.created,
            // Additional info
            product_name: product.name,
            company_name: company.name,
            customer_name: customerName,
            customer_email: customerEmail,
        };
    }
    /**
     * Simulate QRIS Payment (Test Mode Only)
     * @param qrId - QR Code ID
     * @param amount - Amount to simulate
     * @param forUserId - Sub-account user ID (REQUIRED for sub-account QR codes)
     */
    async simulateQRISPayment(qrId, amount, forUserId) {
        console.log('🎮 Simulating QRIS payment:', { qrId, amount, forUserId });
        // Jika forUserId tidak di-pass, coba ambil dari stored mapping
        let actualForUserId = forUserId;
        if (!actualForUserId) {
            const mapping = this.qrMappings.get(qrId);
            if (mapping) {
                actualForUserId = mapping.forUserId;
                console.log('📦 Found stored mapping:', {
                    qrId,
                    forUserId: actualForUserId,
                });
            }
            else {
                console.log('⚠️ No mapping found for qrId:', qrId);
            }
        }
        const result = await this.xendit.simulateQRISPayment(qrId, amount, actualForUserId);
        return {
            success: true,
            message: 'QRIS payment simulated successfully',
            data: result,
        };
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [xendit_service_1.XenditService,
        companies_service_1.CompaniesService,
        products_service_1.ProductsService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map
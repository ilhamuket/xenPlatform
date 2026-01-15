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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsController = void 0;
// src/transactions/transactions.controller.ts
const common_1 = require("@nestjs/common");
const transactions_service_1 = require("./transactions.service");
const create_qris_transaction_dto_1 = require("./dto/create-qris-transaction.dto");
const simulate_qris_payment_dto_1 = require("./dto/simulate-qris-payment.dto");
let TransactionsController = class TransactionsController {
    constructor(transactionsService) {
        this.transactionsService = transactionsService;
    }
    /**
     * Create QRIS Payment
     * POST /transactions/:productId/qris
     */
    async createQRIS(productId, dto) {
        return this.transactionsService.createQRISPayment(+productId, dto.customerName, dto.customerEmail, dto.channelCode);
    }
    /**
     * Simulate QRIS Payment (Test Mode Only)
     * POST /transactions/simulate-qris-payment/:qrId
     */
    async simulateQRISPayment(qrId, dto) {
        return this.transactionsService.simulateQRISPayment(qrId, dto.amount);
    }
};
exports.TransactionsController = TransactionsController;
__decorate([
    (0, common_1.Post)(':productId/qris'),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_qris_transaction_dto_1.CreateQRISTransactionDto]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "createQRIS", null);
__decorate([
    (0, common_1.Post)('simulate-qris-payment/:qrId'),
    __param(0, (0, common_1.Param)('qrId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, simulate_qris_payment_dto_1.SimulateQRISPaymentDto]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "simulateQRISPayment", null);
exports.TransactionsController = TransactionsController = __decorate([
    (0, common_1.Controller)('transactions'),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService])
], TransactionsController);
//# sourceMappingURL=transactions.controller.js.map
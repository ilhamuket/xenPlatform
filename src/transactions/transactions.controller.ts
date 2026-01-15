// src/transactions/transactions.controller.ts
import { Controller, Post, Body, Param } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateQRISTransactionDto } from './dto/create-qris-transaction.dto';
import { SimulateQRISPaymentDto } from './dto/simulate-qris-payment.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * Create QRIS Payment
   * POST /transactions/:productId/qris
   */
  @Post(':productId/qris')
  async createQRIS(
    @Param('productId') productId: string,
    @Body() dto: CreateQRISTransactionDto,
  ) {
    return this.transactionsService.createQRISPayment(
      +productId,
      dto.customerName,
      dto.customerEmail,
      dto.channelCode,
    );
  }

  /**
   * Simulate QRIS Payment (Test Mode Only)
   * POST /transactions/simulate-qris-payment/:qrId
   */
  @Post('simulate-qris-payment/:qrId')
  async simulateQRISPayment(
    @Param('qrId') qrId: string,
    @Body() dto: SimulateQRISPaymentDto,
  ) {
    return this.transactionsService.simulateQRISPayment(qrId, dto.amount);
  }
}
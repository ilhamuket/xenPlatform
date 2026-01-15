// src/transactions/dto/simulate-qris-payment.dto.ts
import { IsNumber, IsPositive } from 'class-validator';

export class SimulateQRISPaymentDto {
  @IsNumber()
  @IsPositive()
  amount!: number;
}
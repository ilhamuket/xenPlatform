// src/transactions/dto/create-qris-transaction.dto.ts
import { IsString, IsEmail, IsNotEmpty, IsIn } from 'class-validator';

export class CreateQRISTransactionDto {
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsEmail()
  @IsNotEmpty()
  customerEmail: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['ID_DANA', 'ID_LINKAJA', 'ID_OVO', 'ID_SHOPEEPAY'], {
    message: 'channelCode must be one of: ID_DANA, ID_LINKAJA, ID_OVO, ID_SHOPEEPAY',
  })
  channelCode: string;
}
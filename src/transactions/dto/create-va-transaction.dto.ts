// src/transactions/dto/create-va-transaction.dto.ts
import { IsEmail, IsNotEmpty, IsString, IsIn } from 'class-validator';

export class CreateVaTransactionDto {
  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @IsEmail()
  @IsNotEmpty()
  customerEmail!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['BCA', 'BNI', 'BRI', 'MANDIRI', 'PERMATA'])
  bankCode!: string;
}
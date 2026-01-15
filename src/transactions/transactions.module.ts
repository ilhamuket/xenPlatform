import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { XenditModule } from '../xendit/xendit.module';
import { CompaniesService } from '../companies/companies.service';
import { ProductsService } from '../products/products.service';

@Module({
  imports: [XenditModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, CompaniesService, ProductsService],
})
export class TransactionsModule {}

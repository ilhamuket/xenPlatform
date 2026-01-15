import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductsService {
  private products = [
    { id: 10, name: 'Kaos', price: 100000, companyId: 1 },
    { id: 11, name: 'Jaket', price: 250000, companyId: 2 },
  ];

  findOne(id: number) {
    return this.products.find((p) => p.id === id);
  }
}

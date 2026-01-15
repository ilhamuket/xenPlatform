import { Injectable } from '@nestjs/common';

@Injectable()
export class CompaniesService {
  private companies = [
    { id: 1, name: 'RICH', forUserId: '69664cf74350841a7840a408' },
    { id: 2, name: 'CAKRA', forUserId: '69664d18f0c4c0d968ad7426' },
  ];

  findOne(id: number) {
    return this.companies.find((c) => c.id === id);
  }
}

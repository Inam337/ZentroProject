import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from '../entities/sale.entity';

@Injectable()
export class SaleService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepo: Repository<Sale>,
  ) {}

  async create(data: Partial<Sale>): Promise<Sale> {
    const sale = this.saleRepo.create(data);
    return this.saleRepo.save(sale);
  }

  findAll(): Promise<Sale[]> {
    return this.saleRepo.find({ relations: ['items'] });
  }

  async findOne(id: number): Promise<Sale> {
    const sale = await this.saleRepo.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!sale) throw new NotFoundException('Sale not found');
    return sale;
  }

  async remove(id: number): Promise<void> {
    const sale = await this.findOne(id);
    await this.saleRepo.remove(sale);
  }
}

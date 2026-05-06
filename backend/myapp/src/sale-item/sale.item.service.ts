import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaleItem } from '../entities/sale.item.entity';

@Injectable()
export class SaleItemService {
  constructor(
    @InjectRepository(SaleItem)
    private readonly saleItemRepo: Repository<SaleItem>,
  ) {}

  async create(data: Partial<SaleItem>): Promise<SaleItem> {
    const item = this.saleItemRepo.create(data);
    return this.saleItemRepo.save(item);
  }

  findAll(): Promise<SaleItem[]> {
    return this.saleItemRepo.find({ relations: ['sale', 'product'] });
  }

  async findOne(id: number): Promise<SaleItem> {
    const item = await this.saleItemRepo.findOne({
      where: { id },
      relations: ['sale', 'product'],
    });
    if (!item) throw new NotFoundException('Sale item not found');
    return item;
  }

  async update(id: number, data: Partial<SaleItem>): Promise<SaleItem> {
    await this.findOne(id);
    await this.saleItemRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
    await this.saleItemRepo.remove(item);
  }
}

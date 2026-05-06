import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseItem } from '../entities/purchase.item.entity';

@Injectable()
export class PurchaseItemService {
  constructor(
    @InjectRepository(PurchaseItem)
    private readonly purchaseItemRepo: Repository<PurchaseItem>,
  ) {}

  async create(data: Partial<PurchaseItem>): Promise<PurchaseItem> {
    const item = this.purchaseItemRepo.create(data);
    return this.purchaseItemRepo.save(item);
  }

  findAll(): Promise<PurchaseItem[]> {
    return this.purchaseItemRepo.find({ relations: ['product', 'purchase'] });
  }

  async findOne(id: number): Promise<PurchaseItem> {
    const item = await this.purchaseItemRepo.findOne({
      where: { id },
      relations: ['product', 'purchase'],
    });
    if (!item) throw new NotFoundException('Purchase item not found');
    return item;
  }

  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
    await this.purchaseItemRepo.remove(item);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Purchase } from '../entities/purchase.entity';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectRepository(Purchase)
    private purchaseRepo: Repository<Purchase>,
  ) {}

  async create(data: Partial<Purchase>): Promise<Purchase> {
    const purchase = this.purchaseRepo.create(data);
    return this.purchaseRepo.save(purchase);
  }

  findAll(): Promise<Purchase[]> {
    return this.purchaseRepo.find({ relations: ['supplier', 'items'] });
  }

  async findOne(id: number): Promise<Purchase> {
    const purchase = await this.purchaseRepo.findOne({
      where: { id },
      relations: ['supplier', 'items'],
    });
    if (!purchase) throw new NotFoundException('Purchase not found');
    return purchase;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from '../entities/stock.entity';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Stock)
    private readonly stockRepo: Repository<Stock>,
  ) {}

  async create(data: Partial<Stock>): Promise<Stock> {
    const stock = this.stockRepo.create(data);
    return this.stockRepo.save(stock);
  }

  findAll(): Promise<Stock[]> {
    return this.stockRepo.find({ relations: ['product'] });
  }

  async findOne(id: number): Promise<Stock> {
    const stock = await this.stockRepo.findOne({
      where: { id },
      relations: ['product'],
    });
    if (!stock) throw new NotFoundException('Stock not found');
    return stock;
  }

  async update(id: number, data: Partial<Stock>): Promise<Stock> {
    await this.findOne(id); // check existence
    await this.stockRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const stock = await this.findOne(id);
    await this.stockRepo.remove(stock);
  }
}

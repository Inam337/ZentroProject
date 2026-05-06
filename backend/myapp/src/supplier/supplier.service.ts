import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from '../entities/supplier.entity';

@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepo: Repository<Supplier>,
  ) {}

  async create(data: Partial<Supplier>): Promise<Supplier> {
    const supplier = this.supplierRepo.create(data);
    return this.supplierRepo.save(supplier);
  }

  findAll(): Promise<Supplier[]> {
    return this.supplierRepo.find({ relations: ['purchases'] });
  }

  async findOne(id: number): Promise<Supplier> {
    const supplier = await this.supplierRepo.findOne({
      where: { id },
      relations: ['purchases'],
    });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async update(id: number, data: Partial<Supplier>): Promise<Supplier> {
    await this.findOne(id); // Check existence
    await this.supplierRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const supplier = await this.findOne(id);
    await this.supplierRepo.remove(supplier);
  }
}

import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { Purchase } from '../entities/purchase.entity';

@Controller('purchases')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  create(@Body() body: Partial<Purchase>): Promise<Purchase> {
    return this.purchaseService.create(body);
  }

  @Get()
  findAll(): Promise<Purchase[]> {
    return this.purchaseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Purchase> {
    return this.purchaseService.findOne(id);
  }
}

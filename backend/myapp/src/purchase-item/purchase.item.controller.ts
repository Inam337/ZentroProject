import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { PurchaseItemService } from './purchase.item.service';
import { PurchaseItem } from '../entities/purchase.item.entity';

@Controller('purchase-items')
export class PurchaseItemController {
  constructor(private readonly purchaseItemService: PurchaseItemService) {}

  @Post()
  create(@Body() body: Partial<PurchaseItem>): Promise<PurchaseItem> {
    return this.purchaseItemService.create(body);
  }

  @Get()
  findAll(): Promise<PurchaseItem[]> {
    return this.purchaseItemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<PurchaseItem> {
    return this.purchaseItemService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.purchaseItemService.remove(id);
  }
}

import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { SaleService } from './sale.service';
import { Sale } from '../entities/sale.entity';

@Controller('sales')
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  @Post()
  create(@Body() body: Partial<Sale>): Promise<Sale> {
    return this.saleService.create(body);
  }

  @Get()
  findAll(): Promise<Sale[]> {
    return this.saleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Sale> {
    return this.saleService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.saleService.remove(id);
  }
}

import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { SaleItemService } from './sale.item.service';
import { SaleItem } from '../entities/sale.item.entity';

@Controller('sale-items')
export class SaleItemController {
  constructor(private readonly saleItemService: SaleItemService) {}

  @Post()
  create(@Body() body: Partial<SaleItem>): Promise<SaleItem> {
    return this.saleItemService.create(body);
  }

  @Get()
  findAll(): Promise<SaleItem[]> {
    return this.saleItemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<SaleItem> {
    return this.saleItemService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() body: Partial<SaleItem>,
  ): Promise<SaleItem> {
    return this.saleItemService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.saleItemService.remove(id);
  }
}

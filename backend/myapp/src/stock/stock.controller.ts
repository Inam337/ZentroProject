import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { Stock } from '../entities/stock.entity';

@Controller('stocks')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  create(@Body() body: Partial<Stock>): Promise<Stock> {
    return this.stockService.create(body);
  }

  @Get()
  findAll(): Promise<Stock[]> {
    return this.stockService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Stock> {
    return this.stockService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() body: Partial<Stock>,
  ): Promise<Stock> {
    return this.stockService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.stockService.remove(id);
  }
}

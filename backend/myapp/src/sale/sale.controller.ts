import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { SaleService } from './sale.service';
import { Sale } from '../entities/sale.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';

import { CurrentUserId } from '../common/decorators/current-user-id.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { AdminOnly } from '../auth/roles.decorator';

@AdminOnly()
@Controller('sales')
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  @Post()
  create(
    @Body() body: CreateSaleDto,
    @CurrentUserId() userId: number,
  ): Promise<Sale> {
    return this.saleService.create(body, userId);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.saleService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Sale> {
    return this.saleService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateSaleDto,
    @CurrentUserId() userId: number,
  ): Promise<Sale> {
    return this.saleService.update(id, body, userId);
  }

  @Post(':id/cancel')
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
  ): Promise<Sale> {
    return this.saleService.cancel(id, userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
  ): Promise<void> {
    return this.saleService.remove(id, userId);
  }
}

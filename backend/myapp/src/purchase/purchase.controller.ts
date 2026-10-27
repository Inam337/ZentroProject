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
import { PurchaseService } from './purchase.service';
import { Purchase } from '../entities/purchase.entity';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';

import { CurrentUserId } from '../common/decorators/current-user-id.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { AdminOnly } from '../auth/roles.decorator';

@AdminOnly()
@Controller('purchases')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  create(
    @Body() body: CreatePurchaseDto,
    @CurrentUserId() userId: number,
  ): Promise<Purchase> {
    return this.purchaseService.create(body, userId);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.purchaseService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Purchase> {
    return this.purchaseService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePurchaseDto,
    @CurrentUserId() userId: number,
  ): Promise<Purchase> {
    return this.purchaseService.update(id, body, userId);
  }

  @Post(':id/cancel')
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
  ): Promise<Purchase> {
    return this.purchaseService.cancel(id, userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
  ): Promise<void> {
    return this.purchaseService.remove(id, userId);
  }
}

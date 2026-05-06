import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaleItem } from '../entities/sale.item.entity';
import { SaleItemService } from './sale.item.service';
import { SaleItemController } from './sale.item.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SaleItem])],
  providers: [SaleItemService],
  controllers: [SaleItemController],
})
export class SaleItemModule {}

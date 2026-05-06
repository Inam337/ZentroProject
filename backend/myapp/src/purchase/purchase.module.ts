import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Purchase } from '../entities/purchase.entity';
import { PurchaseItem } from '../entities/purchase.item.entity';
import { Supplier } from '../entities/supplier.entity';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Purchase, PurchaseItem, Supplier])],
  providers: [PurchaseService],
  controllers: [PurchaseController],
})
export class PurchaseModule {}

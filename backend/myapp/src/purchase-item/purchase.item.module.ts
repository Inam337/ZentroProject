import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseItem } from '../entities/purchase.item.entity';
import { Product } from '../entities/product.entity';
import { Purchase } from '../entities/purchase.entity';
import { PurchaseItemService } from './purchase.item.service';
import { PurchaseItemController } from './purchase.item.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseItem, Product, Purchase])],
  providers: [PurchaseItemService],
  controllers: [PurchaseItemController],
})
export class PurchaseItemModule {}

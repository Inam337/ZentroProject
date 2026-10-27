import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Purchase } from '../entities/purchase.entity';
import { PurchaseItem } from '../entities/purchase.item.entity';
import { Supplier } from '../entities/supplier.entity';
import { Product } from '../entities/product.entity';
import { InventoryModule } from '../inventory/inventory.module';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { PurchaseRepository } from './purchase.repository';

@Module({
  imports: [AuthModule, InventoryModule, TypeOrmModule.forFeature([Purchase, PurchaseItem, Supplier, Product])],
  providers: [PurchaseRepository, PurchaseService],
  controllers: [PurchaseController],
  exports: [PurchaseRepository, TypeOrmModule],
})
export class PurchaseModule {}

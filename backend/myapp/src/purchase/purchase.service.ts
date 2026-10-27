import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { Purchase } from '../entities/purchase.entity';
import { PurchaseItem } from '../entities/purchase.item.entity';
import { Supplier } from '../entities/supplier.entity';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { PurchaseLineDto } from './dto/purchase-line.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { PurchaseRepository } from './purchase.repository';
import { PaginationQueryDto, toPage } from '../common/dto/pagination-query.dto';
import { InventoryService } from '../inventory/inventory.service';
import { DocumentStatus } from '../entities/document-status.enum';
import { StockMovementType } from '../entities/stock-movement.entity';

@Injectable()
export class PurchaseService {
  constructor(
    private readonly purchaseRepository: PurchaseRepository,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(PurchaseItem)
    private readonly purchaseItemRepo: Repository<PurchaseItem>,
    @InjectRepository(Supplier)
    private readonly supplierRepo: Repository<Supplier>,
    private readonly dataSource: DataSource,
    private readonly inventory: InventoryService,
  ) {}

  private async resolveSupplier(supplierId?: number): Promise<Supplier | null> {
    if (supplierId == null) {
      return null;
    }
    const supplier = await this.supplierRepo.findOne({ where: { id: supplierId } });
    if (!supplier) {
      throw new BadRequestException(`Supplier ${supplierId} not found`);
    }
    return supplier;
  }

  private async buildItems(lines: PurchaseLineDto[]): Promise<PurchaseItem[]> {
    if (!lines.length) {
      throw new BadRequestException('Purchase requires at least one item');
    }

    const items: PurchaseItem[] = [];
    for (const line of lines) {
      const product = await this.productRepo.findOne({
        where: { id: line.productId, isActive: true },
      });
      if (!product) {
        throw new BadRequestException(`Product ${line.productId} not found`);
      }
      items.push(
        this.purchaseItemRepo.create({
          product,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        }),
      );
    }
    return items;
  }

  private calculateTotal(items: PurchaseItem[]): number {
    const total = items.reduce(
      (sum, item) => sum + Number(item.unitPrice) * item.quantity,
      0,
    );
    // totalAmount is decimal(10,2); fail cleanly instead of a DB overflow (500).
    if (total > 99_999_999.99) {
      throw new BadRequestException('Total amount is too large');
    }
    return total;
  }

  private async receive(
    manager: EntityManager,
    purchase: Purchase,
    userId?: number,
  ): Promise<void> {
    for (const item of purchase.items) {
      await this.inventory.increase(manager, item.product.id, item.quantity, {
        type: StockMovementType.PURCHASE,
        referenceId: purchase.id,
        userId,
      });
    }
  }

  private async reverse(
    manager: EntityManager,
    purchase: Purchase,
    userId?: number,
  ): Promise<void> {
    for (const item of purchase.items) {
      await this.inventory.decrease(manager, item.product.id, item.quantity, {
        type: StockMovementType.PURCHASE_REVERSAL,
        referenceId: purchase.id,
        userId,
      });
    }
  }

  /** Creates the purchase and adds every line to stock in one transaction. */
  async create(dto: CreatePurchaseDto, userId?: number): Promise<Purchase> {
    const items = await this.buildItems(dto.items);
    const supplier = (await this.resolveSupplier(dto.supplierId)) ?? undefined;
    const id = await this.dataSource.transaction(async (manager) => {
      const purchase = await manager.getRepository(Purchase).save(
        manager.getRepository(Purchase).create({
          supplier,
          items,
          totalAmount: this.calculateTotal(items),
        }),
      );
      await this.receive(manager, purchase, userId);
      return purchase.id;
    });
    return this.findOne(id);
  }

  async findAll(query: PaginationQueryDto = {}) {
    if (query.page == null) {
      return this.purchaseRepository.findAllWithRelations();
    }
    const limit = query.limit ?? 20;
    const [data, total] = await this.purchaseRepository.findPageWithRelations(
      query.page,
      limit,
    );
    return toPage(data, total, query.page, limit);
  }

  async findOne(id: number): Promise<Purchase> {
    const purchase = await this.purchaseRepository.findByIdWithRelations(id);
    if (!purchase) throw new NotFoundException('Purchase not found');
    return purchase;
  }

  /** Changing lines reverses the old stock effect, then applies the new one. */
  async update(
    id: number,
    dto: UpdatePurchaseDto,
    userId?: number,
  ): Promise<Purchase> {
    const existing = await this.findOne(id);
    if (existing.status === DocumentStatus.CANCELLED) {
      throw new BadRequestException('A cancelled purchase cannot be edited');
    }
    const supplier =
      dto.supplierId !== undefined
        ? await this.resolveSupplier(dto.supplierId)
        : undefined;
    const newItems =
      dto.items !== undefined ? await this.buildItems(dto.items) : undefined;

    await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Purchase);
      if (supplier !== undefined) {
        existing.supplier = supplier as Supplier;
      }
      if (newItems) {
        await this.reverse(manager, existing, userId);
        await manager.getRepository(PurchaseItem).delete({
          purchase: { id },
        });
        existing.items = newItems;
        existing.totalAmount = this.calculateTotal(newItems);
      }
      const saved = await repo.save(existing);
      if (newItems) {
        await this.receive(manager, saved, userId);
      }
    });
    return this.findOne(id);
  }

  /** Deleting a purchase takes its quantities back out of stock. */
  async remove(id: number, userId?: number): Promise<void> {
    const purchase = await this.findOne(id);
    await this.dataSource.transaction(async (manager) => {
      // A cancelled purchase already gave its stock back.
      if (purchase.status !== DocumentStatus.CANCELLED) {
        await this.reverse(manager, purchase, userId);
      }
      await manager.getRepository(Purchase).remove(purchase);
    });
  }

  /** Keeps the record for audit but takes its quantities back out of stock. */
  async cancel(id: number, userId?: number): Promise<Purchase> {
    const purchase = await this.findOne(id);
    if (purchase.status === DocumentStatus.CANCELLED) {
      throw new BadRequestException('Purchase is already cancelled');
    }
    await this.dataSource.transaction(async (manager) => {
      await this.reverse(manager, purchase, userId);
      purchase.status = DocumentStatus.CANCELLED;
      await manager.getRepository(Purchase).save(purchase);
    });
    return this.findOne(id);
  }
}

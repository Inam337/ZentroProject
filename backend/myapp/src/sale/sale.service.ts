import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { Product } from '../entities/product.entity';
import { Sale } from '../entities/sale.entity';
import { SaleItem } from '../entities/sale.item.entity';
import { DocumentStatus } from '../entities/document-status.enum';
import { StockMovementType } from '../entities/stock-movement.entity';
import { PaginationQueryDto, toPage } from '../common/dto/pagination-query.dto';
import { InventoryService } from '../inventory/inventory.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SaleLineDto } from './dto/sale-line.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { SaleRepository } from './sale.repository';

@Injectable()
export class SaleService {
  constructor(
    private readonly saleRepository: SaleRepository,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(SaleItem)
    private readonly saleItemRepo: Repository<SaleItem>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    private readonly dataSource: DataSource,
    private readonly inventory: InventoryService,
  ) {}

  private async resolveCustomer(customerId?: number): Promise<Customer | null> {
    if (customerId == null) {
      return null;
    }
    const customer = await this.customerRepo.findOne({
      where: { id: customerId },
    });
    if (!customer) {
      throw new BadRequestException(`Customer ${customerId} not found`);
    }
    return customer;
  }

  private async buildItems(lines: SaleLineDto[]): Promise<SaleItem[]> {
    if (!lines.length) {
      throw new BadRequestException('Sale requires at least one item');
    }

    const items: SaleItem[] = [];
    for (const line of lines) {
      const product = await this.productRepo.findOne({
        where: { id: line.productId, isActive: true },
      });
      if (!product) {
        throw new BadRequestException(`Product ${line.productId} not found`);
      }
      items.push(
        this.saleItemRepo.create({
          product,
          quantity: line.quantity,
          unitPrice: line.unitPrice ?? Number(product.price),
        }),
      );
    }
    return items;
  }

  private calculateTotal(items: SaleItem[]): number {
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

  private async deliver(
    manager: EntityManager,
    sale: Sale,
    userId?: number,
  ): Promise<void> {
    for (const item of sale.items) {
      await this.inventory.decrease(manager, item.product.id, item.quantity, {
        type: StockMovementType.SALE,
        referenceId: sale.id,
        userId,
      });
    }
  }

  private async restore(
    manager: EntityManager,
    sale: Sale,
    userId?: number,
  ): Promise<void> {
    for (const item of sale.items) {
      await this.inventory.increase(manager, item.product.id, item.quantity, {
        type: StockMovementType.SALE_REVERSAL,
        referenceId: sale.id,
        userId,
      });
    }
  }

  /** Creates the sale and deducts stock; fails if any line is over-stock. */
  async create(dto: CreateSaleDto, userId?: number): Promise<Sale> {
    const items = await this.buildItems(dto.items);
    const customer = await this.resolveCustomer(dto.customerId);
    const id = await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Sale);
      const sale = await repo.save(
        repo.create({
          customer,
          items,
          totalAmount: this.calculateTotal(items),
        }),
      );
      await this.deliver(manager, sale, userId);
      return sale.id;
    });
    return this.findOne(id);
  }

  async findAll(query: PaginationQueryDto = {}) {
    if (query.page == null) {
      return this.saleRepository.findAllWithRelations();
    }
    const limit = query.limit ?? 20;
    const [data, total] = await this.saleRepository.findPageWithRelations(
      query.page,
      limit,
    );
    return toPage(data, total, query.page, limit);
  }

  async findOne(id: number): Promise<Sale> {
    const sale = await this.saleRepository.findByIdWithRelations(id);
    if (!sale) throw new NotFoundException('Sale not found');
    return sale;
  }

  async update(id: number, dto: UpdateSaleDto, userId?: number): Promise<Sale> {
    const existing = await this.findOne(id);
    if (existing.status === DocumentStatus.CANCELLED) {
      throw new BadRequestException('A cancelled sale cannot be edited');
    }
    const customer =
      dto.customerId !== undefined
        ? await this.resolveCustomer(dto.customerId)
        : undefined;
    const newItems =
      dto.items !== undefined ? await this.buildItems(dto.items) : undefined;

    await this.dataSource.transaction(async (manager) => {
      if (customer !== undefined) {
        existing.customer = customer;
      }
      if (newItems) {
        await this.restore(manager, existing, userId);
        await manager.getRepository(SaleItem).delete({ sale: { id } });
        existing.items = newItems;
        existing.totalAmount = this.calculateTotal(newItems);
      }
      const saved = await manager.getRepository(Sale).save(existing);
      if (newItems) {
        await this.deliver(manager, saved, userId);
      }
    });
    return this.findOne(id);
  }

  /** Deleting a sale puts its quantities back into stock. */
  async remove(id: number, userId?: number): Promise<void> {
    const sale = await this.findOne(id);
    await this.dataSource.transaction(async (manager) => {
      // A cancelled sale already returned its stock.
      if (sale.status !== DocumentStatus.CANCELLED) {
        await this.restore(manager, sale, userId);
      }
      await manager.getRepository(Sale).remove(sale);
    });
  }

  /** Keeps the record for audit but puts its quantities back into stock. */
  async cancel(id: number, userId?: number): Promise<Sale> {
    const sale = await this.findOne(id);
    if (sale.status === DocumentStatus.CANCELLED) {
      throw new BadRequestException('Sale is already cancelled');
    }
    await this.dataSource.transaction(async (manager) => {
      await this.restore(manager, sale, userId);
      sale.status = DocumentStatus.CANCELLED;
      await manager.getRepository(Sale).save(sale);
    });
    return this.findOne(id);
  }
}

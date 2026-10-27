import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { Stock } from '../entities/stock.entity';
import { InventoryService } from '../inventory/inventory.service';
import { StockMovementType } from '../entities/stock-movement.entity';
import { WriteOffStockDto } from './dto/write-off-stock.dto';
import { CreateStockDto } from './dto/create-stock.dto';
import { StockQueryDto } from './dto/stock-query.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { StockRepository } from './stock.repository';

@Injectable()
export class StockService {
  constructor(
    private readonly stockRepository: StockRepository,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly dataSource: DataSource,
    private readonly inventory: InventoryService,
  ) {}

  private async resolveProduct(productId: number): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id: productId, isActive: true },
    });
    if (!product) {
      throw new BadRequestException(`Product ${productId} not found`);
    }
    return product;
  }

  /** One row per product + location (enforced here to stay safe on old data). */
  private async assertUnique(
    productId: number,
    location: string,
    ignoreId?: number,
  ): Promise<void> {
    const dup = await this.dataSource.getRepository(Stock).findOne({
      where: { product: { id: productId }, location },
    });
    if (dup && dup.id !== ignoreId) {
      throw new ConflictException(
        `Stock for product ${productId} at "${location}" already exists (id ${dup.id}). Edit it instead.`,
      );
    }
  }

  async create(dto: CreateStockDto, userId?: number): Promise<Stock> {
    const product = await this.resolveProduct(dto.productId);
    await this.assertUnique(product.id, dto.location);
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Stock);
      const saved = await repo.save(
        repo.create({
          product,
          quantity: dto.quantity,
          location: dto.location,
        }),
      );
      await this.inventory.logAdjustment(
        manager,
        product.id,
        dto.quantity,
        `Manual stock created at ${dto.location}`,
        userId,
      );
      return saved;
    });
  }

  async findAll(query: StockQueryDto = {}) {
    if (query.page == null) {
      return this.stockRepository.findAllWithRelations();
    }
    const limit = query.limit ?? 20;
    const qb = this.dataSource
      .getRepository(Stock)
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.product', 'p')
      .orderBy('s.id', 'ASC')
      .skip((query.page - 1) * limit)
      .take(limit);
    if (query.search?.trim()) {
      qb.where('p.name ILIKE :q OR p.sku ILIKE :q OR s.location ILIKE :q', {
        q: `%${query.search.trim()}%`,
      });
    }
    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      total,
      page: query.page,
      limit,
      pages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findOne(id: number): Promise<Stock> {
    const stock = await this.stockRepository.findByIdWithRelations(id);
    if (!stock) throw new NotFoundException('Stock not found');
    return stock;
  }

  async update(
    id: number,
    dto: UpdateStockDto,
    userId?: number,
  ): Promise<Stock> {
    const stock = await this.findOne(id);
    const before = stock.quantity;
    const beforeProductId = stock.product.id;
    const next: Partial<Stock> = {};

    if (dto.productId !== undefined) {
      next.product = await this.resolveProduct(dto.productId);
    }
    if (dto.quantity !== undefined) next.quantity = dto.quantity;
    if (dto.location !== undefined) next.location = dto.location;

    await this.assertUnique(
      next.product?.id ?? beforeProductId,
      next.location ?? stock.location,
      id,
    );

    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Stock);
      const saved = await repo.save(repo.merge(stock, next));
      if (next.product && next.product.id !== beforeProductId) {
        await this.inventory.logAdjustment(
          manager,
          beforeProductId,
          -before,
          'Stock row moved to another product',
          userId,
        );
        await this.inventory.logAdjustment(
          manager,
          next.product.id,
          saved.quantity,
          'Stock row moved from another product',
          userId,
        );
      } else {
        await this.inventory.logAdjustment(
          manager,
          beforeProductId,
          saved.quantity - before,
          'Manual stock edit',
          userId,
        );
      }
      return saved;
    });
  }

  /** Removes units from stock with a reason; rejected if it would go below zero. */
  async writeOff(dto: WriteOffStockDto, userId?: number) {
    const product = await this.resolveProduct(dto.productId);
    await this.dataSource.transaction(async (manager) => {
      await this.inventory.decrease(manager, product.id, dto.quantity, {
        type: StockMovementType.ADJUSTMENT,
        userId,
        note: `Write-off: ${dto.reason}`,
      });
    });
    const [row] = (await this.inventory.summary()).filter(
      (r) => r.productId === product.id,
    );
    return {
      productId: product.id,
      removed: dto.quantity,
      remaining: row?.totalQuantity ?? 0,
      status: row?.status ?? 'out',
    };
  }

  async remove(id: number, userId?: number): Promise<void> {
    const stock = await this.findOne(id);
    await this.dataSource.transaction(async (manager) => {
      await this.inventory.logAdjustment(
        manager,
        stock.product.id,
        -stock.quantity,
        `Stock row removed (${stock.location})`,
        userId,
      );
      await manager.getRepository(Stock).remove(stock);
    });
  }
}

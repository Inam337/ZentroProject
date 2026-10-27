import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductType } from '../entities/product-type.enum';
import { Stock } from '../entities/stock.entity';
import {
  StockMovement,
  StockMovementType,
} from '../entities/stock-movement.entity';

export const DEFAULT_LOCATION = 'Main';

export interface MovementContext {
  type: StockMovementType;
  referenceId?: number;
  userId?: number;
  note?: string;
}

/**
 * Single place that changes stock quantities. Always call with the
 * EntityManager of the surrounding transaction so stock and the document
 * (purchase / sale / order) commit or roll back together.
 */
@Injectable()
export class InventoryService {
  constructor(private readonly dataSource: DataSource) {}

  /** Add stock to the first location, creating "Main" if the product has none. */
  async increase(
    manager: EntityManager,
    productId: number,
    quantity: number,
    ctx: MovementContext,
  ): Promise<void> {
    if (quantity <= 0 || !(await this.tracksStock(manager, productId))) return;
    const stockRepo = manager.getRepository(Stock);
    let row = await stockRepo.findOne({
      where: { product: { id: productId } },
      order: { id: 'ASC' },
    });
    if (row) {
      row.quantity += quantity;
    } else {
      row = stockRepo.create({
        product: { id: productId } as Product,
        quantity,
        location: DEFAULT_LOCATION,
      });
    }
    await stockRepo.save(row);
    await this.log(manager, productId, quantity, ctx);
  }

  /** Remove stock across locations; throws if the total is insufficient. */
  async decrease(
    manager: EntityManager,
    productId: number,
    quantity: number,
    ctx: MovementContext,
  ): Promise<void> {
    if (quantity <= 0 || !(await this.tracksStock(manager, productId))) return;
    const stockRepo = manager.getRepository(Stock);
    const rows = await stockRepo.find({
      where: { product: { id: productId } },
      order: { id: 'ASC' },
      lock: { mode: 'pessimistic_write' },
    });
    const available = rows.reduce((sum, r) => sum + r.quantity, 0);
    if (available < quantity) {
      const product = await manager
        .getRepository(Product)
        .findOne({ where: { id: productId } });
      throw new BadRequestException(
        `Insufficient stock for "${product?.name ?? `product ${productId}`}": ` +
          `requested ${quantity}, available ${available}`,
      );
    }

    let remaining = quantity;
    for (const row of rows) {
      if (remaining === 0) break;
      const take = Math.min(row.quantity, remaining);
      row.quantity -= take;
      remaining -= take;
      await stockRepo.save(row);
    }
    await this.log(manager, productId, -quantity, ctx);
  }

  /** Services and digital products have no physical stock. */
  private async tracksStock(
    manager: EntityManager,
    productId: number,
  ): Promise<boolean> {
    const product = await manager
      .getRepository(Product)
      .findOne({ where: { id: productId }, select: ['id', 'type'] });
    return product?.type === ProductType.GOODS;
  }

  /** Record a manual change made through the /stocks CRUD endpoints. */
  async logAdjustment(
    manager: EntityManager,
    productId: number,
    change: number,
    note: string,
    userId?: number,
  ): Promise<void> {
    if (change === 0) return;
    await this.log(manager, productId, change, {
      type: StockMovementType.ADJUSTMENT,
      userId,
      note,
    });
  }

  private async log(
    manager: EntityManager,
    productId: number,
    change: number,
    ctx: MovementContext,
  ): Promise<void> {
    const repo = manager.getRepository(StockMovement);
    await repo.save(
      repo.create({
        product: { id: productId } as Product,
        change,
        type: ctx.type,
        referenceId: ctx.referenceId ?? null,
        userId: ctx.userId ?? null,
        note: ctx.note ?? null,
      }),
    );
  }

  // ----- read models -------------------------------------------------------

  /** Totals per active goods product, with low / out-of-stock flags. */
  async summary(opts: { lowOnly?: boolean } = {}) {
    const rows = await this.dataSource
      .getRepository(Product)
      .createQueryBuilder('p')
      .leftJoin('p.stockEntries', 's')
      .select('p.id', 'productId')
      .addSelect('p.name', 'name')
      .addSelect('p.sku', 'sku')
      .addSelect('p.unit', 'unit')
      .addSelect('p.price', 'price')
      .addSelect('p.reorderLevel', 'reorderLevel')
      .addSelect('COALESCE(SUM(s.quantity), 0)', 'totalQuantity')
      .where('p.isActive = true')
      .andWhere("p.type = 'goods'")
      .groupBy('p.id')
      .orderBy('p.name', 'ASC')
      .getRawMany<{
        productId: number;
        name: string;
        sku: string | null;
        unit: string;
        price: string;
        reorderLevel: number;
        totalQuantity: string;
      }>();

    const mapped = rows.map((r) => {
      const totalQuantity = Number(r.totalQuantity);
      const reorderLevel = Number(r.reorderLevel);
      return {
        productId: Number(r.productId),
        name: r.name,
        sku: r.sku,
        unit: r.unit,
        price: Number(r.price),
        reorderLevel,
        totalQuantity,
        stockValue: +(totalQuantity * Number(r.price)).toFixed(2),
        status:
          totalQuantity === 0
            ? ('out' as const)
            : totalQuantity <= reorderLevel
              ? ('low' as const)
              : ('ok' as const),
      };
    });
    return opts.lowOnly ? mapped.filter((r) => r.status !== 'ok') : mapped;
  }

  async movements(opts: {
    productId?: number;
    type?: StockMovementType;
    page: number;
    limit: number;
  }) {
    const qb = this.dataSource
      .getRepository(StockMovement)
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.product', 'p')
      .orderBy('m.id', 'DESC')
      .skip((opts.page - 1) * opts.limit)
      .take(opts.limit);
    if (opts.productId) qb.andWhere('p.id = :pid', { pid: opts.productId });
    if (opts.type) qb.andWhere('m.type = :type', { type: opts.type });
    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      total,
      page: opts.page,
      limit: opts.limit,
      pages: Math.max(1, Math.ceil(total / opts.limit)),
    };
  }
}

import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OrderStatus } from '../entities/order-status.enum';
import { DocumentStatus } from '../entities/document-status.enum';
import { Purchase } from '../entities/purchase.entity';
import { Sale } from '../entities/sale.entity';
import { SaleItem } from '../entities/sale.item.entity';
import { Order } from '../order/entities/order.entity';
import { Product } from '../entities/product.entity';
import { InventoryService } from '../inventory/inventory.service';

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isoDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

@Injectable()
export class ReportsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly inventory: InventoryService,
  ) {}

  private async sumSince(
    entity: typeof Sale | typeof Purchase,
    dateColumn: 'soldAt' | 'purchasedAt',
    since: Date,
  ): Promise<{ total: number; count: number }> {
    const row = await this.dataSource
      .getRepository(entity)
      .createQueryBuilder('t')
      .select('COALESCE(SUM(t.totalAmount), 0)', 'total')
      .addSelect('COUNT(*)', 'count')
      .where(`t.${dateColumn} >= :since`, { since })
      .andWhere('t.status = :done', { done: DocumentStatus.COMPLETED })
      .getRawOne<{ total: string; count: string }>();
    return { total: Number(row?.total ?? 0), count: Number(row?.count ?? 0) };
  }

  /** KPI snapshot for the admin dashboard. */
  async dashboard() {
    const today = startOfDay(new Date());
    const since30 = new Date(today.getTime() - 29 * DAY_MS);

    const [stock, salesToday, purchasesToday, sales30, purchases30] =
      await Promise.all([
        this.inventory.summary(),
        this.sumSince(Sale, 'soldAt', today),
        this.sumSince(Purchase, 'purchasedAt', today),
        this.sumSince(Sale, 'soldAt', since30),
        this.sumSince(Purchase, 'purchasedAt', since30),
      ]);

    const orderRows = await this.dataSource
      .getRepository(Order)
      .createQueryBuilder('o')
      .select('o.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('o.status')
      .getRawMany<{ status: OrderStatus; count: string }>();
    const ordersByStatus: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      cancelled: 0,
    };
    for (const r of orderRows) ordersByStatus[r.status] = Number(r.count);

    const topRows = await this.dataSource
      .getRepository(SaleItem)
      .createQueryBuilder('i')
      .innerJoin('i.product', 'p')
      .innerJoin('i.sale', 's')
      .select('p.id', 'productId')
      .addSelect('p.name', 'name')
      .addSelect('SUM(i.quantity)', 'quantity')
      .addSelect('SUM(i.quantity * i.unitPrice)', 'revenue')
      .where('s.soldAt >= :since', { since: since30 })
      .andWhere('s.status = :done', { done: DocumentStatus.COMPLETED })
      .groupBy('p.id')
      .orderBy('quantity', 'DESC')
      .limit(5)
      .getRawMany<{
        productId: number;
        name: string;
        quantity: string;
        revenue: string;
      }>();

    return {
      products: stock.length,
      stockUnits: stock.reduce((s, r) => s + r.totalQuantity, 0),
      stockValue: +stock.reduce((s, r) => s + r.stockValue, 0).toFixed(2),
      lowStockCount: stock.filter((r) => r.status === 'low').length,
      outOfStockCount: stock.filter((r) => r.status === 'out').length,
      salesToday,
      purchasesToday,
      sales30d: sales30,
      purchases30d: purchases30,
      ordersByStatus,
      topProducts: topRows.map((r) => ({
        productId: Number(r.productId),
        name: r.name,
        quantity: Number(r.quantity),
        revenue: Number(r.revenue),
      })),
    };
  }

  /** Units and value of active goods grouped by category. */
  async stockByCategory() {
    const rows = await this.dataSource
      .getRepository(Product)
      .createQueryBuilder('p')
      .leftJoin('p.category', 'c')
      .leftJoin('p.stockEntries', 's')
      .select("COALESCE(c.name, 'Uncategorized')", 'category')
      .addSelect('COUNT(DISTINCT p.id)', 'products')
      .addSelect('COALESCE(SUM(s.quantity), 0)', 'units')
      .addSelect('COALESCE(SUM(s.quantity * p.price), 0)', 'value')
      .where('p.isActive = true')
      .andWhere("p.type = 'goods'")
      .groupBy('c.name')
      .orderBy('value', 'DESC')
      .getRawMany<{
        category: string;
        products: string;
        units: string;
        value: string;
      }>();
    return rows.map((r) => ({
      category: r.category,
      products: Number(r.products),
      units: Number(r.units),
      value: Number(r.value),
    }));
  }

  /** Daily sales vs purchases between two dates (inclusive), zero-filled. */
  async salesPurchases(from?: string, to?: string) {
    const end = startOfDay(to ? new Date(to) : new Date());
    const start = startOfDay(
      from ? new Date(from) : new Date(end.getTime() - 29 * DAY_MS),
    );
    const endExclusive = new Date(end.getTime() + DAY_MS);

    const daily = async (
      entity: typeof Sale | typeof Purchase,
      col: 'soldAt' | 'purchasedAt',
    ) => {
      const rows = await this.dataSource
        .getRepository(entity)
        .createQueryBuilder('t')
        .select(`TO_CHAR(t.${col}, 'YYYY-MM-DD')`, 'day')
        .addSelect('COALESCE(SUM(t.totalAmount), 0)', 'total')
        .where(`t.${col} >= :start AND t.${col} < :end`, {
          start,
          end: endExclusive,
        })
        .andWhere('t.status = :done', { done: DocumentStatus.COMPLETED })
        .groupBy('day')
        .getRawMany<{ day: string; total: string }>();
      return new Map(rows.map((r) => [r.day, Number(r.total)]));
    };

    const [sales, purchases] = await Promise.all([
      daily(Sale, 'soldAt'),
      daily(Purchase, 'purchasedAt'),
    ]);

    const series: { date: string; sales: number; purchases: number }[] = [];
    for (let t = start.getTime(); t <= end.getTime(); t += DAY_MS) {
      const key = isoDay(new Date(t));
      series.push({
        date: key,
        sales: sales.get(key) ?? 0,
        purchases: purchases.get(key) ?? 0,
      });
    }
    return {
      from: isoDay(start),
      to: isoDay(end),
      totalSales: series.reduce((s, r) => s + r.sales, 0),
      totalPurchases: series.reduce((s, r) => s + r.purchases, 0),
      series,
    };
  }
}

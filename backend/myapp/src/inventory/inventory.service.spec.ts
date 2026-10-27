import { BadRequestException } from '@nestjs/common';
import { Product } from '../entities/product.entity';
import { ProductType } from '../entities/product-type.enum';
import { Stock } from '../entities/stock.entity';
import {
  StockMovement,
  StockMovementType,
} from '../entities/stock-movement.entity';
import { InventoryService } from './inventory.service';

type Row = { id: number; quantity: number; location: string };

function build(rows: Row[], productType = ProductType.GOODS) {
  const movements: Partial<StockMovement>[] = [];
  const saved: Row[] = [];
  const stockRepo = {
    find: jest.fn().mockResolvedValue(rows),
    findOne: jest.fn().mockResolvedValue(rows[0] ?? null),
    create: jest.fn((v) => v),
    save: jest.fn(async (v: Row) => {
      saved.push({ ...v });
      return v;
    }),
  };
  const movementRepo = {
    create: jest.fn((v) => v),
    save: jest.fn(async (v) => {
      movements.push(v);
      return v;
    }),
  };
  const productRepo = {
    findOne: jest
      .fn()
      .mockResolvedValue({ id: 1, name: 'Widget', type: productType }),
  };
  const manager = {
    getRepository: (entity: unknown) =>
      entity === Stock
        ? stockRepo
        : entity === StockMovement
          ? movementRepo
          : entity === Product
            ? productRepo
            : undefined,
  };
  const service = new InventoryService({} as never);
  return { service, manager: manager as never, movements, saved, stockRepo };
}

const ctx = { type: StockMovementType.SALE, referenceId: 9, userId: 2 };

describe('InventoryService', () => {
  it('increase adds to the first location and logs a positive movement', async () => {
    const rows = [{ id: 1, quantity: 5, location: 'Main' }];
    const { service, manager, movements } = build(rows);
    await service.increase(manager, 1, 7, ctx);
    expect(rows[0].quantity).toBe(12);
    expect(movements[0]).toMatchObject({ change: 7, referenceId: 9 });
  });

  it('increase creates a "Main" row when the product has no stock yet', async () => {
    const { service, manager, stockRepo } = build([]);
    await service.increase(manager, 1, 4, ctx);
    expect(stockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ quantity: 4, location: 'Main' }),
    );
  });

  it('decrease drains locations in order and logs a negative movement', async () => {
    const rows = [
      { id: 1, quantity: 3, location: 'A' },
      { id: 2, quantity: 10, location: 'B' },
    ];
    const { service, manager, movements } = build(rows);
    await service.decrease(manager, 1, 5, ctx);
    expect(rows.map((r) => r.quantity)).toEqual([0, 8]);
    expect(movements[0]).toMatchObject({ change: -5 });
  });

  it('decrease rejects when total stock is insufficient and changes nothing', async () => {
    const rows = [{ id: 1, quantity: 2, location: 'Main' }];
    const { service, manager, movements, saved } = build(rows);
    await expect(service.decrease(manager, 1, 3, ctx)).rejects.toThrow(
      BadRequestException,
    );
    expect(rows[0].quantity).toBe(2);
    expect(saved).toHaveLength(0);
    expect(movements).toHaveLength(0);
  });

  it('ignores non-goods products (services / digital)', async () => {
    const rows = [{ id: 1, quantity: 0, location: 'Main' }];
    const { service, manager, movements } = build(rows, ProductType.SERVICE);
    await service.decrease(manager, 1, 50, ctx);
    expect(movements).toHaveLength(0);
  });
});

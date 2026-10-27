import { BadRequestException } from '@nestjs/common';
import { DocumentStatus } from '../entities/document-status.enum';
import { Sale } from '../entities/sale.entity';
import { StockMovementType } from '../entities/stock-movement.entity';
import { SaleService } from './sale.service';

function setup(status: DocumentStatus) {
  const sale = {
    id: 7,
    status,
    items: [
      { product: { id: 1 }, quantity: 3 },
      { product: { id: 2 }, quantity: 2 },
    ],
  } as unknown as Sale;

  const saved: Sale[] = [];
  const manager = {
    getRepository: () => ({
      save: jest.fn(async (s: Sale) => {
        saved.push(s);
        return s;
      }),
    }),
  };
  const dataSource = {
    transaction: jest.fn(async (fn: (m: unknown) => unknown) => fn(manager)),
  };
  const inventory = {
    increase: jest.fn().mockResolvedValue(undefined),
    decrease: jest.fn().mockResolvedValue(undefined),
  };
  const saleRepository = {
    findByIdWithRelations: jest.fn().mockResolvedValue(sale),
  };
  const service = new SaleService(
    saleRepository as never,
    {} as never,
    {} as never,
    {} as never,
    dataSource as never,
    inventory as never,
  );
  return { service, sale, inventory, saved };
}

describe('SaleService cancel', () => {
  it('restores every line to stock and marks the sale cancelled', async () => {
    const { service, inventory, saved } = setup(DocumentStatus.COMPLETED);
    await service.cancel(7, 1);

    expect(inventory.increase).toHaveBeenCalledTimes(2);
    expect(inventory.increase).toHaveBeenCalledWith(
      expect.anything(),
      1,
      3,
      expect.objectContaining({
        type: StockMovementType.SALE_REVERSAL,
        referenceId: 7,
      }),
    );
    expect(saved[0].status).toBe(DocumentStatus.CANCELLED);
  });

  it('rejects cancelling twice, without touching stock', async () => {
    const { service, inventory } = setup(DocumentStatus.CANCELLED);
    await expect(service.cancel(7, 1)).rejects.toThrow(BadRequestException);
    expect(inventory.increase).not.toHaveBeenCalled();
  });

  it('does not restore stock again when deleting a cancelled sale', async () => {
    const { service, inventory } = setup(DocumentStatus.CANCELLED);
    await service.remove(7, 1).catch(() => undefined);
    expect(inventory.increase).not.toHaveBeenCalled();
  });

  it('refuses to edit a cancelled sale', async () => {
    const { service } = setup(DocumentStatus.CANCELLED);
    await expect(service.update(7, { items: [] }, 1)).rejects.toThrow(
      BadRequestException,
    );
  });
});

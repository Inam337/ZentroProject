import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from '../order-item/entities/order-item.entity';
import { OrderStatus } from '../entities/order-status.enum';
import { Users } from '../entities/user.entity';
import { OrderRepository } from './order.repository';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { InventoryService } from '../inventory/inventory.service';
import { StockMovementType } from '../entities/stock-movement.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class OrderService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly orderRepository: OrderRepository,
    private readonly inventory: InventoryService,
  ) {}

  private async deductStock(
    manager: EntityManager,
    order: Order,
    userId: number,
  ): Promise<void> {
    for (const line of order.items) {
      await this.inventory.decrease(manager, line.product.id, line.quantity, {
        type: StockMovementType.ORDER,
        referenceId: order.id,
        userId,
      });
    }
  }

  private async restoreStock(
    manager: EntityManager,
    order: Order,
    userId: number,
  ): Promise<void> {
    for (const line of order.items) {
      await this.inventory.increase(manager, line.product.id, line.quantity, {
        type: StockMovementType.ORDER_REVERSAL,
        referenceId: order.id,
        userId,
      });
    }
  }

  async createOrder(userId: number): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const cartRepo = manager.getRepository(Cart);
      const cartItemRepo = manager.getRepository(CartItem);
      const orderRepo = manager.getRepository(Order);
      const orderItemRepo = manager.getRepository(OrderItem);

      const cart = await cartRepo.findOne({
        where: { user: { id: userId } },
        relations: ['items', 'items.product'],
      });

      if (!cart?.items?.length) {
        throw new BadRequestException('Cart is empty');
      }

      let total = 0;
      const orderItems: OrderItem[] = [];

      for (const line of cart.items) {
        const product = line.product;
        if (!product?.isActive) {
          throw new BadRequestException(
            `Product ${product?.id ?? '?'} is not available`,
          );
        }
        const unitPrice = Number(product.price);
        if (Number.isNaN(unitPrice)) {
          throw new BadRequestException('Invalid product price');
        }
        const lineTotal = unitPrice * line.quantity;
        total += lineTotal;

        orderItems.push(
          orderItemRepo.create({
            product,
            quantity: line.quantity,
            price: unitPrice.toFixed(2),
          }),
        );
      }

      const order = orderRepo.create({
        user: { id: userId } as Users,
        totalAmount: total.toFixed(2),
        status: OrderStatus.PENDING,
      });
      const saved = await orderRepo.save(order);

      for (const line of orderItems) {
        line.order = saved;
      }
      await orderItemRepo.save(orderItems);

      await cartItemRepo.delete({ cart: { id: cart.id } });

      const created = await orderRepo.findOneOrFail({
        where: { id: saved.id },
        relations: ['items', 'items.product'],
      });
      // Fails the whole checkout (and rolls back the order) if stock is short.
      await this.deductStock(manager, created, userId);
      return created;
    });
  }

  async findAllForUser(userId: number): Promise<Order[]> {
    return this.orderRepository.listForUser(userId);
  }

  async findOneForUser(userId: number, orderId: number): Promise<Order> {
    const order = await this.orderRepository.findForUser(userId, orderId);
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
    return order;
  }

  async updateStatusForUser(
    userId: number,
    orderId: number,
    dto: UpdateOrderStatusDto,
  ): Promise<Order> {
    // Shoppers may only cancel their own order; confirming is an admin action.
    if (dto.status !== OrderStatus.CANCELLED) {
      const user = await this.dataSource
        .getRepository(Users)
        .findOne({ where: { id: userId }, select: ['id', 'role'] });
      if (user?.role !== 'admin') {
        throw new ForbiddenException('Only an admin can set this status');
      }
    }

    const order = await this.findOneForUser(userId, orderId);
    const previous = order.status;
    await this.dataSource.transaction(async (manager) => {
      // Cancelling returns stock; un-cancelling takes it out again.
      if (previous !== OrderStatus.CANCELLED && dto.status === OrderStatus.CANCELLED) {
        await this.restoreStock(manager, order, userId);
      } else if (previous === OrderStatus.CANCELLED && dto.status !== OrderStatus.CANCELLED) {
        await this.deductStock(manager, order, userId);
      }
      order.status = dto.status;
      await manager.getRepository(Order).save(order);
    });
    return this.findOneForUser(userId, orderId);
  }

  async removeForUser(userId: number, orderId: number): Promise<void> {
    const order = await this.findOneForUser(userId, orderId);
    await this.dataSource.transaction(async (manager) => {
      if (order.status !== OrderStatus.CANCELLED) {
        await this.restoreStock(manager, order, userId);
      }
      await manager.getRepository(Order).remove(order);
    });
  }
}

import {
  Controller,
  Post,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUserId } from '../common/decorators/current-user-id.decorator';
import { Order } from './entities/order.entity';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('checkout')
  checkout(@CurrentUserId() userId: number): Promise<Order> {
    return this.orderService.createOrder(userId);
  }

  @Get()
  findAll(@CurrentUserId() userId: number): Promise<Order[]> {
    return this.orderService.findAllForUser(userId);
  }

  @Get(':id')
  findOne(
    @CurrentUserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Order> {
    return this.orderService.findOneForUser(userId, id);
  }
}

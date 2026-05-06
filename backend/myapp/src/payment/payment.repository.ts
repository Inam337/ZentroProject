import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentRepository {
  constructor(
    @InjectRepository(Payment)
    private readonly repo: Repository<Payment>,
  ) {}

  create(partial: Partial<Payment>): Payment {
    return this.repo.create(partial);
  }

  async save(payment: Payment): Promise<Payment> {
    return this.repo.save(payment);
  }

  async findByIdWithOrderUser(id: number): Promise<Payment | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['order', 'order.user'],
    });
  }
}

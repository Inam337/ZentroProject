import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';

export enum StockMovementType {
  PURCHASE = 'purchase',
  PURCHASE_REVERSAL = 'purchase_reversal',
  SALE = 'sale',
  SALE_REVERSAL = 'sale_reversal',
  ORDER = 'order',
  ORDER_REVERSAL = 'order_reversal',
  ADJUSTMENT = 'adjustment',
}

/** Append-only audit trail: one row per stock change. */
@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  /** Signed: positive = stock in, negative = stock out. */
  @Column('int')
  change: number;

  @Column({ type: 'enum', enum: StockMovementType })
  type: StockMovementType;

  /** Id of the purchase / sale / order that caused the movement. */
  @Column({ type: 'int', nullable: true })
  referenceId: number | null;

  @Column({ type: 'int', nullable: true })
  userId: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  note: string | null;

  @CreateDateColumn()
  createdAt: Date;
}

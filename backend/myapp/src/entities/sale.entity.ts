import { DocumentStatus } from './document-status.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Customer } from './customer.entity';
import { SaleItem } from './sale.item.entity';
@Entity()
export class Sale {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customer, { nullable: true, onDelete: 'SET NULL' })
  customer: Customer | null;

  @OneToMany(() => SaleItem, (item) => item.sale, { cascade: true })
  items: SaleItem[];

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.COMPLETED,
  })
  status: DocumentStatus;

  @CreateDateColumn()
  soldAt: Date;
}

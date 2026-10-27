import { PurchaseItem } from './purchase.item.entity';
import { Supplier } from './supplier.entity';
import { DocumentStatus } from './document-status.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
@Entity()
export class Purchase {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Supplier, (supplier) => supplier.purchases, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  supplier: Supplier;

  @OneToMany(() => PurchaseItem, (item) => item.purchase, { cascade: true })
  items: PurchaseItem[];

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.COMPLETED,
  })
  status: DocumentStatus;

  @CreateDateColumn()
  purchasedAt: Date;
}

import type { DecimalAmount, IsoDateString } from './common';
import type { Customer } from './Customer';
import type { SaleItem } from './SaleItem';

export interface Sale {
  id: number;
  totalAmount: DecimalAmount;
  status?: 'completed' | 'cancelled';
  customer?: Customer | null;
  items?: SaleItem[];
  soldAt?: IsoDateString;
}

export interface SaleItemInput {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface CreateSaleRequest {
  customerId?: number;
  items: SaleItemInput[];
}

export interface UpdateSaleRequest {
  items: SaleItemInput[];
}

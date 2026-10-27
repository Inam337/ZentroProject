import type { IsoDateString } from './common';
import type { Product } from './Product';

export type StockStatus = 'ok' | 'low' | 'out';

export interface StockSummaryRow {
  productId: number;
  name: string;
  sku: string | null;
  unit: string;
  price: number;
  reorderLevel: number;
  totalQuantity: number;
  stockValue: number;
  status: StockStatus;
}

export type StockMovementType
  = | 'purchase'
    | 'purchase_reversal'
    | 'sale'
    | 'sale_reversal'
    | 'order'
    | 'order_reversal'
    | 'adjustment';

export interface StockMovement {
  id: number;
  change: number;
  type: StockMovementType;
  referenceId: number | null;
  userId: number | null;
  note: string | null;
  createdAt: IsoDateString;
  product?: Product;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface MovementsQuery {
  page?: number;
  limit?: number;
  productId?: number;
  type?: StockMovementType;
}

export interface PeriodTotal {
  total: number;
  count: number;
}

export interface DashboardReport {
  products: number;
  stockUnits: number;
  stockValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  salesToday: PeriodTotal;
  purchasesToday: PeriodTotal;
  sales30d: PeriodTotal;
  purchases30d: PeriodTotal;
  ordersByStatus: Record<string, number>;
  topProducts: { productId: number; name: string; quantity: number; revenue: number }[];
}

export interface CategoryStockRow {
  category: string;
  products: number;
  units: number;
  value: number;
}

export interface SalesPurchasesReport {
  from: string;
  to: string;
  totalSales: number;
  totalPurchases: number;
  series: { date: string; sales: number; purchases: number }[];
}

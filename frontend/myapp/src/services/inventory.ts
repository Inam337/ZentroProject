import { AppConstants } from '@/common/AppConstants';
import type {
  ApiResult,
  CategoryStockRow,
  DashboardReport,
  MovementsQuery,
  Paginated,
  SalesPurchasesReport,
  StockMovement,
  StockSummaryRow,
} from '@/models';
import { apiGet, apiPost } from '@/services/api-request';

export const getStockSummary = (): Promise<ApiResult<StockSummaryRow[]>> =>
  apiGet<StockSummaryRow[]>(AppConstants.ApiUrls.StockSummary);

export const getLowStock = (): Promise<ApiResult<StockSummaryRow[]>> =>
  apiGet<StockSummaryRow[]>(AppConstants.ApiUrls.StockLow);

export const listStockMovements = (
  query: MovementsQuery = {},
): Promise<ApiResult<Paginated<StockMovement>>> =>
  apiGet<Paginated<StockMovement>>(AppConstants.ApiUrls.StockMovements, {
    params: query,
  });

export const getDashboardReport = (): Promise<ApiResult<DashboardReport>> =>
  apiGet<DashboardReport>(AppConstants.ApiUrls.ReportsDashboard);

export const getSalesPurchasesReport = (
  from?: string,
  to?: string,
): Promise<ApiResult<SalesPurchasesReport>> =>
  apiGet<SalesPurchasesReport>(AppConstants.ApiUrls.ReportsSalesPurchases, {
    params: { from, to },
  });

export const getStockByCategory = (): Promise<ApiResult<CategoryStockRow[]>> =>
  apiGet<CategoryStockRow[]>(AppConstants.ApiUrls.ReportsStockByCategory);

export interface WriteOffRequest {
  productId: number;
  quantity: number;
  reason: string;
}

export interface WriteOffResult {
  productId: number;
  removed: number;
  remaining: number;
  status: 'ok' | 'low' | 'out';
}

export const writeOffStock = (payload: WriteOffRequest): Promise<ApiResult<WriteOffResult>> =>
  apiPost<WriteOffResult>(AppConstants.ApiUrls.StockWriteOff, payload);

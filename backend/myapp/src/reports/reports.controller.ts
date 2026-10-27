import { Controller, Get, Query } from '@nestjs/common';
import { IsDateString, IsOptional } from 'class-validator';
import { AdminOnly } from '../auth/roles.decorator';
import { ReportsService } from './reports.service';

class DateRangeQuery {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}

@AdminOnly()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('dashboard')
  dashboard() {
    return this.reports.dashboard();
  }

  @Get('stock-by-category')
  stockByCategory() {
    return this.reports.stockByCategory();
  }

  @Get('sales-purchases')
  salesPurchases(@Query() q: DateRangeQuery) {
    return this.reports.salesPurchases(q.from, q.to);
  }
}

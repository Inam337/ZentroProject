import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { Stock } from '../entities/stock.entity';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { StockQueryDto } from './dto/stock-query.dto';
import { WriteOffStockDto } from './dto/write-off-stock.dto';
import { AdminOnly } from '../auth/roles.decorator';
import { CurrentUserId } from '../common/decorators/current-user-id.decorator';
import { InventoryService } from '../inventory/inventory.service';
import { MovementsQueryDto } from '../inventory/dto/movements-query.dto';

@AdminOnly()
@Controller('stocks')
export class StockController {
  constructor(
    private readonly stockService: StockService,
    private readonly inventory: InventoryService,
  ) {}

  @Post()
  create(
    @Body() body: CreateStockDto,
    @CurrentUserId() userId: number,
  ): Promise<Stock> {
    return this.stockService.create(body, userId);
  }

  /** Remove units from stock (damage, expiry, loss) with a reason. */
  @Post('write-off')
  writeOff(@Body() body: WriteOffStockDto, @CurrentUserId() userId: number) {
    return this.stockService.writeOff(body, userId);
  }

  @Get()
  findAll(@Query() query: StockQueryDto) {
    return this.stockService.findAll(query);
  }

  /** Total quantity, value and status (ok / low / out) per product. */
  @Get('summary')
  summary() {
    return this.inventory.summary();
  }

  /** Products at or below their reorder level (including out of stock). */
  @Get('low')
  low() {
    return this.inventory.summary({ lowOnly: true });
  }

  /** Paginated stock audit trail. */
  @Get('movements')
  movements(@Query() query: MovementsQueryDto) {
    return this.inventory.movements(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Stock> {
    return this.stockService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateStockDto,
    @CurrentUserId() userId: number,
  ): Promise<Stock> {
    return this.stockService.update(id, body, userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
  ): Promise<void> {
    return this.stockService.remove(id, userId);
  }
}

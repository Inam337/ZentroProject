import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { Supplier } from '../entities/supplier.entity';

@Controller('suppliers')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  create(@Body() body: Partial<Supplier>): Promise<Supplier> {
    return this.supplierService.create(body);
  }

  @Get()
  findAll(): Promise<Supplier[]> {
    return this.supplierService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Supplier> {
    return this.supplierService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() body: Partial<Supplier>,
  ): Promise<Supplier> {
    return this.supplierService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.supplierService.remove(id);
  }
}

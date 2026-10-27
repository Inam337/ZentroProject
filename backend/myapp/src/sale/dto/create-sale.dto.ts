import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, Min, ValidateNested } from 'class-validator';
import { SaleLineDto } from './sale-line.dto';

export class CreateSaleDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  customerId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleLineDto)
  items: SaleLineDto[];
}

import { Type } from 'class-transformer';
import { IsInt, IsString, MaxLength, Min, MinLength } from 'class-validator';

/** Remove units from stock (damage, expiry, loss, internal use). */
export class WriteOffStockDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  reason: string;
}

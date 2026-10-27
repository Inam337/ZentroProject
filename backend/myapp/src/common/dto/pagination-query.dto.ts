import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/** Opt-in pagination: omit `page` to keep the legacy plain-array response. */
export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export function toPage<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): Paginated<T> {
  return { data, total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) };
}

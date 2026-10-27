import { DataSource } from 'typeorm';
import { DatabaseConfigOptions } from './database.config';
import { AddStockMovementsAndSaleCustomer1761500000000 } from '../migrations/1761500000000-AddStockMovementsAndSaleCustomer';

/** CLI data source for `pnpm run migration:run` / `migration:revert`. */
export default new DataSource({
  ...DatabaseConfigOptions,
  synchronize: false,
  migrations: [AddStockMovementsAndSaleCustomer1761500000000],
});

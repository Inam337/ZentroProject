import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Inventory upgrade: stock audit trail + optional customer on sales.
 * Idempotent, so it is safe on databases that dev `synchronize` already touched.
 */
export class AddStockMovementsAndSaleCustomer1761500000000
  implements MigrationInterface
{
  name = 'AddStockMovementsAndSaleCustomer1761500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "stock_movements_type_enum" AS ENUM (
          'purchase', 'purchase_reversal', 'sale', 'sale_reversal',
          'order', 'order_reversal', 'adjustment'
        );
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "stock_movements" (
        "id" SERIAL PRIMARY KEY,
        "change" integer NOT NULL,
        "type" "stock_movements_type_enum" NOT NULL,
        "referenceId" integer,
        "userId" integer,
        "note" character varying(255),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "product_id" integer,
        CONSTRAINT "FK_stock_movements_product"
          FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_stock_movements_product" ON "stock_movements" ("product_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale" ADD COLUMN IF NOT EXISTS "customerId" integer`,
    );
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "sale" ADD CONSTRAINT "FK_sale_customer"
          FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE SET NULL;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "purchase_status_enum" AS ENUM ('completed', 'cancelled');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "sale_status_enum" AS ENUM ('completed', 'cancelled');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
    await queryRunner.query(
      `ALTER TABLE "purchase" ADD COLUMN IF NOT EXISTS "status" "purchase_status_enum" NOT NULL DEFAULT 'completed'`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale" ADD COLUMN IF NOT EXISTS "status" "sale_status_enum" NOT NULL DEFAULT 'completed'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sale" DROP COLUMN IF EXISTS "status"`);
    await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN IF EXISTS "status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "sale_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "purchase_status_enum"`);
    await queryRunner.query(
      `ALTER TABLE "sale" DROP CONSTRAINT IF EXISTS "FK_sale_customer"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale" DROP COLUMN IF EXISTS "customerId"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "stock_movements"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "stock_movements_type_enum"`);
  }
}

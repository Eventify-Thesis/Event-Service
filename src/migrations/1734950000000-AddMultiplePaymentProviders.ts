import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMultiplePaymentProviders1734950000000
  implements MigrationInterface
{
  name = 'AddMultiplePaymentProviders1734950000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add payment provider columns
    await queryRunner.query(`
            ALTER TABLE "orders" 
            ADD COLUMN "payment_provider" VARCHAR(20) DEFAULT 'stripe',
            ADD COLUMN "payment_provider_transaction_id" VARCHAR(255),
            ADD COLUMN "payment_provider_metadata" TEXT,
            ADD COLUMN "payment_redirect_url" VARCHAR(500),
            ADD COLUMN "payment_qr_code" TEXT
        `);

    // Create index for payment provider
    await queryRunner.query(`
            CREATE INDEX "IDX_orders_payment_provider" ON "orders" ("payment_provider")
        `);

    // Update existing records to use stripe as default
    await queryRunner.query(`
            UPDATE "orders" 
            SET "payment_provider" = 'stripe' 
            WHERE "payment_provider" IS NULL
        `);

    // Make payment_provider NOT NULL
    await queryRunner.query(`
            ALTER TABLE "orders" 
            ALTER COLUMN "payment_provider" SET NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_orders_payment_provider"`);
    await queryRunner.query(`
            ALTER TABLE "orders" 
            DROP COLUMN "payment_provider",
            DROP COLUMN "payment_provider_transaction_id",
            DROP COLUMN "payment_provider_metadata",
            DROP COLUMN "payment_redirect_url",
            DROP COLUMN "payment_qr_code"
        `);
  }
}

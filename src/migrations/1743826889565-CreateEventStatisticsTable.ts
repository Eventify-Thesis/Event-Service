import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEventStatisticsTable1743826889565 implements MigrationInterface {
  name = 'CreateEventStatisticsTable1743826889565';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "event_statistics" (
        "id" SERIAL PRIMARY KEY,
        "event_id" INTEGER NOT NULL,
        "unique_views" BIGINT NOT NULL DEFAULT 0,
        "total_views" BIGINT NOT NULL DEFAULT 0,
        "sales_total_gross" NUMERIC(14,2) NOT NULL DEFAULT 0.00,
        "sales_total_net" NUMERIC(14,2) NOT NULL DEFAULT 0.00,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW(),
        "deleted_at" TIMESTAMP,
        "tickets_sold" INTEGER NOT NULL DEFAULT 0,
        "version" INTEGER NOT NULL DEFAULT 0,
        "orders_created" INTEGER NOT NULL DEFAULT 0,
        "total_discount" NUMERIC(14,2) NOT NULL DEFAULT 0.00,
        CONSTRAINT "FK_event_statistics_events" FOREIGN KEY ("event_id") 
          REFERENCES "events" ("id")
      );

      CREATE INDEX IF NOT EXISTS "IDX_event_statistics_event_id"
        ON "event_statistics" ("event_id");

      CREATE TABLE IF NOT EXISTS "event_daily_statistics" (
        "id" SERIAL PRIMARY KEY,
        "event_id" INTEGER NOT NULL,
        "date" DATE NOT NULL,
        "sales_total_gross" NUMERIC(14,2) NOT NULL DEFAULT 0.00,
        "sales_total_net" NUMERIC(14,2) NOT NULL DEFAULT 0.00,
        "tickets_sold" INTEGER NOT NULL DEFAULT 0,
        "orders_created" INTEGER NOT NULL DEFAULT 0,
        "total_discount" NUMERIC(14,2) NOT NULL DEFAULT 0.00,
        "total_views" BIGINT NOT NULL DEFAULT 0,
        "version" INTEGER NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "FK_event_daily_statistics_events" FOREIGN KEY ("event_id") 
          REFERENCES "events" ("id")
      );

      CREATE INDEX IF NOT EXISTS "IDX_event_daily_statistics_event_id"
        ON "event_daily_statistics" ("event_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "event_statistics";
      DROP TABLE IF EXISTS "event_daily_statistics";
    `);
  }
}

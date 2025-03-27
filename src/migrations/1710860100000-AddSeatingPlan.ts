import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSeatingPlan1710860100000 implements MigrationInterface {
  name = 'AddSeatingPlan1710860100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "seating_plans" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "event_id" uuid NOT NULL,
        "name" varchar NOT NULL,
        "description" text NOT NULL,
        "plan" jsonb NOT NULL,
        "locked" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_seating_plan_event" FOREIGN KEY ("event_id") REFERENCES "events"("id")
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "seating_plans";
    `);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSeatingPlanToShow1711808400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "shows"
      ADD COLUMN "seating_plan_id" uuid NULL,
      ADD CONSTRAINT "fk_shows_seating_plan"
      FOREIGN KEY ("seating_plan_id")
      REFERENCES "seating_plans"("id")
      ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "shows"
      DROP CONSTRAINT "fk_shows_seating_plan",
      DROP COLUMN "seating_plan_id"
    `);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateShowSchedulesTable1743826889590 implements MigrationInterface {
  name = 'CreateShowSchedulesTable1743826889590';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "show_schedules" (
        "id" SERIAL PRIMARY KEY,
        "event_id" INTEGER NOT NULL,
        "show_id" INTEGER NOT NULL,
        "title" VARCHAR NOT NULL,
        "description" TEXT,
        "start_time" TIMESTAMP NOT NULL,
        "end_time" TIMESTAMP NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      ALTER TABLE "show_schedules" 
      ADD CONSTRAINT "FK_show_schedules_shows" 
      FOREIGN KEY ("show_id") 
      REFERENCES "shows"("id") 
      ON DELETE CASCADE;
    
      ALTER TABLE "show_schedules"
      ADD CONSTRAINT "FK_show_schedules_events" 
      FOREIGN KEY ("event_id") 
      REFERENCES "events"("id") 
      ON DELETE CASCADE;
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "show_schedules" 
      DROP CONSTRAINT "FK_show_schedules_shows"
    `);

    await queryRunner.query(`
      ALTER TABLE "show_schedules" 
      DROP CONSTRAINT "FK_show_schedules_events"
    `);

    await queryRunner.query(`
      DROP TABLE "show_schedules"
    `);
  }
}

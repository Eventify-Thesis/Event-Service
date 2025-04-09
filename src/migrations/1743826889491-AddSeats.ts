import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSeats1743826889491 implements MigrationInterface {
  name = 'AddSeats1743826889491';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create an ENUM for seat status
    await queryRunner.query(`
        CREATE TYPE "public"."seat_status_enum" AS ENUM ('AVAILABLE', 'BOOKED');
      `);

    // 2. Create the seating_plan_seats (or seats) table
    await queryRunner.query(`
        CREATE TABLE "seats" (
          "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          "seating_plan_id" uuid NOT NULL,
          "event_id" uuid NOT NULL,
          "show_id" uuid NOT NULL,
          "zone_id" varchar,
          "row_label" varchar,
          "seat_number" varchar,
          "ticket_type_id" uuid NOT NULL,
          "status" "seat_status_enum" NOT NULL DEFAULT 'AVAILABLE',
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  
          CONSTRAINT "FK_seating_plan" FOREIGN KEY ("seating_plan_id")
            REFERENCES "seating_plans"("id") ON DELETE CASCADE,
  
          CONSTRAINT "FK_event" FOREIGN KEY ("event_id")
            REFERENCES "events"("id") ON DELETE CASCADE,
  
          CONSTRAINT "FK_show" FOREIGN KEY ("show_id")
            REFERENCES "shows"("id") ON DELETE CASCADE,
  
          CONSTRAINT "FK_ticket_type" FOREIGN KEY ("ticket_type_id")
            REFERENCES "ticket_types"("id") ON DELETE CASCADE
        );
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop table first
    await queryRunner.query(`DROP TABLE IF EXISTS "seats";`);
    // Then drop enum type
    await queryRunner.query(`DROP TYPE IF EXISTS "seat_status_enum";`);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSeatCategoryMappingWithShowEvent1720000000000
  implements MigrationInterface
{
  name = 'AddSeatCategoryMappingWithShowEvent1720000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "seat_category_mappings" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "seating_plan_id" uuid NOT NULL,
        "event_id" uuid NOT NULL,
        "show_id" uuid NOT NULL,
        "category" varchar NOT NULL,
        "ticket_type_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_seat_category_mapping_seating_plan" FOREIGN KEY ("seating_plan_id") REFERENCES "seating_plans"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_seat_category_mapping_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_seat_category_mapping_show" FOREIGN KEY ("show_id") REFERENCES "shows"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_seat_category_mapping_ticket_type" FOREIGN KEY ("ticket_type_id") REFERENCES "ticket_types"("id") ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "seat_category_mappings";
    `);
  }
}

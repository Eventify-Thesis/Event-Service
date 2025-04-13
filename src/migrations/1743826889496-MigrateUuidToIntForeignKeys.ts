import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateUuidToIntForeignKeys1743826889496
  implements MigrationInterface
{
  name = 'MigrateUuidToIntForeignKeys1743826889496';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS 
        seats,
        seat_category_mappings,
        seating_plans,
        interests,
        vouchers,
        questions,
        members,
        ticket_types,
        shows,
        settings,
        payment_info
      CASCADE;

      CREATE TABLE "payment_info" (
        "id" SERIAL PRIMARY KEY,
        "event_id" INTEGER UNIQUE,
        "bank_account" VARCHAR NOT NULL,
        "bank_account_name" VARCHAR NOT NULL,
        "bank_account_number" VARCHAR NOT NULL,
        "bank_office" VARCHAR NOT NULL,
        "business_type" business_type_enum NOT NULL DEFAULT 'COMPANY',
        "name" VARCHAR NOT NULL,
        "address" VARCHAR NOT NULL,
        "tax_number" VARCHAR NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_payment_info_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE
      );

      CREATE TABLE "settings" (
        "id" SERIAL PRIMARY KEY,
        "event_id" INTEGER UNIQUE,
        "url" VARCHAR(40) NOT NULL,
        "maximum_attendees" INTEGER NOT NULL,
        "age_restriction" age_restriction_enum NOT NULL,
        "message_attendees" TEXT,
        "is_private" BOOLEAN NOT NULL DEFAULT true,
        "event_description" TEXT,
        "is_refundable" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_setting_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE
      );

      CREATE TABLE "shows" (
        "id" SERIAL PRIMARY KEY,
        "event_id" INTEGER UNIQUE,
        "start_time" TIMESTAMP NOT NULL,
        "end_time" TIMESTAMP NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "seating_plan_id" INTEGER NULL,
        "locked" boolean NOT NULL DEFAULT false,
        CONSTRAINT "fk_show_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE
      );

      CREATE TABLE "ticket_types" (
        "id" SERIAL PRIMARY KEY,
        "event_id" INTEGER NOT NULL,
        "show_id" INTEGER NOT NULL,
        "name" VARCHAR NOT NULL,
        "price" DECIMAL(10,2) NOT NULL,
        "is_free" BOOLEAN NOT NULL DEFAULT false,
        "quantity" INTEGER NOT NULL,
        "min_ticket_purchase" INTEGER,
        "max_ticket_purchase" INTEGER,
        "start_time" TIMESTAMP NOT NULL,
        "end_time" TIMESTAMP NOT NULL,
        "description" TEXT NOT NULL,
        "image_url" VARCHAR NOT NULL,
        "is_hidden" BOOLEAN NOT NULL DEFAULT false,
        "sold_quantity" INTEGER NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_ticket_type_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_ticket_type_show" FOREIGN KEY ("show_id") REFERENCES "shows"("id") ON DELETE CASCADE
      );

      CREATE TABLE "members" (
        "id" SERIAL PRIMARY KEY,
        "user_id" VARCHAR NOT NULL,
        "email" VARCHAR NOT NULL,
        "first_name" VARCHAR NOT NULL,
        "last_name" VARCHAR NOT NULL,
        "organization_id" VARCHAR NOT NULL,
        "event_id" INTEGER NOT NULL,
        "role" event_role_enum NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_member_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE
      );

      CREATE TABLE "questions" (
        "id" SERIAL PRIMARY KEY,
        "event_id" INTEGER NOT NULL,
        "title" VARCHAR NOT NULL,
        "type" question_type_enum NOT NULL,
        "required" BOOLEAN NOT NULL DEFAULT false,
        "options" JSONB,
        "description" TEXT,
        "sort_order" INTEGER NOT NULL,
        "belongs_to" question_belongs_to_enum NOT NULL,
        "is_hidden" BOOLEAN NOT NULL DEFAULT false,
        "ticket_type_ids" JSONB,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_question_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE
      );

      CREATE TABLE "vouchers" (
        "id" SERIAL PRIMARY KEY,
        "event_id" INTEGER NOT NULL,
        "name" VARCHAR NOT NULL,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "code_type" voucher_code_type_enum NOT NULL,
        "bulk_code_prefix" VARCHAR NOT NULL DEFAULT '',
        "bulk_code_number" INTEGER NOT NULL DEFAULT 0,
        "discount_type" voucher_discount_type_enum NOT NULL,
        "discount_value" DECIMAL(10,2) NOT NULL,
        "quantity" INTEGER NOT NULL,
        "is_unlimited" BOOLEAN NOT NULL,
        "max_order_per_user" INTEGER NOT NULL,
        "min_qty_per_order" INTEGER NOT NULL,
        "max_qty_per_order" INTEGER NOT NULL,
        "discount_code" VARCHAR NOT NULL,
        "showing_configs" JSONB,
        "is_all_showings" BOOLEAN NOT NULL,
        "status" voucher_status_enum NOT NULL DEFAULT 'ACTIVE',
        "start_time" TIMESTAMP NOT NULL,
        "end_time" TIMESTAMP NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_voucher_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE
      );

      CREATE TABLE "interests" (
        "id" SERIAL PRIMARY KEY,
        "user_id" VARCHAR NOT NULL,
        "event_id" INTEGER NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_interest_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE
      );

      CREATE TABLE "seating_plans" (
        "id" SERIAL PRIMARY KEY,
        "event_id" INTEGER NOT NULL,
        "name" VARCHAR NOT NULL,
        "description" TEXT NOT NULL,
        "plan" JSONB NOT NULL,
        "locked" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_seating_plan_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE
      );

      CREATE TABLE "seat_category_mappings" (
        "id" SERIAL PRIMARY KEY,
        "seating_plan_id" INTEGER NOT NULL,
        "event_id" INTEGER NOT NULL,
        "show_id" INTEGER NOT NULL,
        "category" VARCHAR NOT NULL,
        "ticket_type_id" INTEGER NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_seat_category_mapping_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_seat_category_mapping_show" FOREIGN KEY ("show_id") REFERENCES "shows"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_seat_category_mapping_ticket_type" FOREIGN KEY ("ticket_type_id") REFERENCES "ticket_types"("id") ON DELETE CASCADE
      );

      CREATE TABLE "seats" (
        "id" uuid PRIMARY KEY,
        "seating_plan_id" INTEGER NOT NULL,
        "event_id" INTEGER NOT NULL,
        "show_id" INTEGER NOT NULL,
        "zone_id" VARCHAR,
        "row_label" VARCHAR,
        "seat_number" VARCHAR,
        "ticket_type_id" INTEGER NOT NULL,
        "status" seat_status_enum NOT NULL DEFAULT 'AVAILABLE',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_show" FOREIGN KEY ("show_id") REFERENCES "shows"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_ticket_type" FOREIGN KEY ("ticket_type_id") REFERENCES "ticket_types"("id") ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS 
        seats,
        seat_category_mappings,
        seating_plans,
        interests,
        vouchers,
        questions,
        members,
        ticket_types,
        shows,
        settings,
        payment_info;
    `);
  }
}

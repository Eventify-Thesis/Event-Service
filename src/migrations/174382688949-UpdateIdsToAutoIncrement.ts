import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateIdsToAutoIncrement1743826889492
  implements MigrationInterface
{
  name = 'UpdateIdsToAutoIncrement1743826889492';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "ticket_types", "shows", "settings", "payment_info", "events" CASCADE;

      CREATE TABLE "events" (
        "id" SERIAL PRIMARY KEY,
        "organization_id" varchar NOT NULL,
        "event_name" varchar NOT NULL,
        "event_description" text,
        "event_type" event_type_enum NOT NULL,
        "status" event_status_enum NOT NULL DEFAULT 'DRAFT',
        "org_name" varchar NOT NULL,
        "org_description" text NOT NULL,
        "org_logo_url" varchar NOT NULL,
        "event_logo_url" varchar NOT NULL,
        "event_banner_url" varchar NOT NULL,
        "venue_name" varchar,
        "city_id" varchar,
        "district_id" varchar,
        "ward_id" varchar,
        "street" varchar,
        "categories" text[] NOT NULL,
        "categories_ids" text[] NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      );

      CREATE TABLE "payment_info" (
        "id" SERIAL PRIMARY KEY,
        "event_id" integer UNIQUE,
        "bank_account" varchar NOT NULL,
        "bank_account_name" varchar NOT NULL,
        "bank_account_number" varchar NOT NULL,
        "bank_office" varchar NOT NULL,
        "business_type" business_type_enum NOT NULL DEFAULT 'COMPANY',
        "company_name" varchar NOT NULL,
        "company_address" varchar NOT NULL,
        "company_tax_number" varchar NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_payment_info_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE
      );

      CREATE TABLE "settings" (
        "id" SERIAL PRIMARY KEY,
        "event_id" integer UNIQUE,
        "url" varchar(40) NOT NULL,
        "maximum_attendees" integer NOT NULL,
        "age_restriction" age_restriction_enum NOT NULL,
        "message_attendees" text,
        "is_private" boolean NOT NULL DEFAULT true,
        "event_description" text,
        "is_refundable" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_setting_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE
      );

      CREATE TABLE "shows" (
        "id" SERIAL PRIMARY KEY,
        "event_id" integer UNIQUE,
        "start_time" TIMESTAMP NOT NULL,
        "end_time" TIMESTAMP NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_show_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE
      );

      CREATE TABLE "ticket_types" (
        "id" SERIAL PRIMARY KEY,
        "event_id" integer NOT NULL,
        "show_id" integer NOT NULL,
        "name" varchar NOT NULL,
        "price" decimal(10,2) NOT NULL,
        "is_free" boolean NOT NULL DEFAULT false, 
        "quantity" integer NOT NULL,
        "min_ticket_purchase" integer,
        "max_ticket_purchase" integer,
        "start_time" TIMESTAMP NOT NULL,
        "end_time" TIMESTAMP NOT NULL,
        "description" text NOT NULL,
        "image_url" varchar NOT NULL,
        "is_hidden" boolean NOT NULL DEFAULT false,
        "sold_quantity" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_ticket_type_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_ticket_type_show" FOREIGN KEY ("show_id") REFERENCES "shows"("id") ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "ticket_types";
      DROP TABLE IF EXISTS "shows";
      DROP TABLE IF EXISTS "settings";
      DROP TABLE IF EXISTS "payment_info";
      DROP TABLE IF EXISTS "events";
    `);
  }
}

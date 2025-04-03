import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1710860000000 implements MigrationInterface {
  name = 'InitialSchema1710860000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."question_type_enum" AS ENUM ('SINGLE_LINE_TEXT', 'MULTI_LINE_TEXT', 'MULTI_SELECT_DROPDOWN', 'DROPDOWN', 'CHECKBOX', 'RADIO', 'ADDRESS', 'PHONE', 'DATE');
            CREATE TYPE "public"."question_belongs_to_enum" AS ENUM ('ORDER', 'TICKET');
            CREATE TYPE "public"."voucher_status_enum" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED');
            CREATE TYPE "public"."event_type_enum" AS ENUM ('ONLINE', 'OFFLINE');
            CREATE TYPE "public"."event_status_enum" AS ENUM ('DRAFT', 'PUBLISHED', 'UPCOMING', 'CANCELLED', 'PENDING_APPROVAL');
            CREATE TYPE "public"."business_type_enum" AS ENUM ('PERSONAL', 'COMPANY');
            CREATE TYPE "public"."age_restriction_enum" AS ENUM ('ALL_AGES', 'OVER_18', 'OVER_21');
            CREATE TYPE "public"."voucher_code_type_enum" AS ENUM ('SINGLE', 'BULK');
            CREATE TYPE "public"."voucher_discount_type_enum" AS ENUM ('PERCENTAGE', 'FIXED');
            CREATE TYPE "public"."event_role_enum" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'VENDOR', 'ENTRY_STAFF');

            CREATE TABLE "categories" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "code" varchar(40) NOT NULL,
                "name_en" varchar(40) NOT NULL,
                "name_vi" varchar(40) NOT NULL,
                "image" varchar NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now()
            );

            CREATE TABLE "cities" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "origin_id" integer NOT NULL,
                "name" varchar(40) NOT NULL,
                "name_en" varchar(40) NOT NULL,
                "type" varchar(20) NOT NULL,
                "type_en" varchar(20) NOT NULL,
                "short_name" varchar(20),
                "country_id" integer NOT NULL,
                "sort" integer NOT NULL,
                "status" integer NOT NULL DEFAULT 1,
                "location_id" varchar(100) NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now()
            );

            CREATE TABLE "districts" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" varchar(40) NOT NULL,
                "name_en" varchar(40) NOT NULL,
                "type" varchar(20) NOT NULL,
                "type_en" varchar(20) NOT NULL,
                "sort" integer NOT NULL,
                "status" integer NOT NULL DEFAULT 1,
                "location" varchar(50),
                "short_name" varchar(20),
                "origin_id" integer NOT NULL,
                "city_id" integer NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now()
            );

            CREATE TABLE "wards" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" varchar(40) NOT NULL,
                "name_en" varchar(40) NOT NULL,
                "type" varchar(20) NOT NULL,
                "type_en" varchar(20) NOT NULL,
                "status" integer NOT NULL DEFAULT 1,
                "sort" integer NOT NULL,
                "origin_id" integer NOT NULL,
                "district_id" integer NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now()
            );

            CREATE TABLE "events" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
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
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "event_id" uuid UNIQUE,
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
                CONSTRAINT "fk_payment_info_event" FOREIGN KEY ("event_id") REFERENCES "events"("id")
            );

            CREATE TABLE "settings" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "event_id" uuid UNIQUE,
                "url" varchar(40) NOT NULL,
                "maximum_attendees" integer NOT NULL,
                "age_restriction" age_restriction_enum NOT NULL,
                "message_attendees" text,
                "is_private" boolean NOT NULL DEFAULT true,
                "event_description" text,
                "is_refundable" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "fk_setting_event" FOREIGN KEY ("event_id") REFERENCES "events"("id")
            );

            CREATE TABLE "shows" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "event_id" uuid UNIQUE,
                "start_time" TIMESTAMP NOT NULL,
                "end_time" TIMESTAMP NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "fk_show_event" FOREIGN KEY ("event_id") REFERENCES "events"("id")
            );

            CREATE TABLE "ticket_types" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "event_id" uuid NOT NULL,
                "show_id" uuid NOT NULL,
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
                CONSTRAINT "fk_ticket_type_event" FOREIGN KEY ("event_id") REFERENCES "events"("id"),
                CONSTRAINT "fk_ticket_type_show" FOREIGN KEY ("show_id") REFERENCES "shows"("id")
            );

            CREATE TABLE "members" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "user_id" varchar NOT NULL,
                "email" varchar NOT NULL,
                "first_name" varchar NOT NULL,
                "last_name" varchar NOT NULL,
                "organization_id" varchar NOT NULL,
                "event_id" uuid NOT NULL,
                "role" event_role_enum NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "fk_member_event" FOREIGN KEY ("event_id") REFERENCES "events"("id")
            );

            CREATE TABLE "questions" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "event_id" uuid NOT NULL,
                "title" varchar NOT NULL,
                "type" question_type_enum NOT NULL,
                "required" boolean NOT NULL DEFAULT false,
                "options" jsonb,
                "description" text,
                "sort_order" integer NOT NULL,
                "belongs_to" question_belongs_to_enum NOT NULL,
                "is_hidden" boolean NOT NULL DEFAULT false,
                "ticket_type_ids" jsonb,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "fk_question_event" FOREIGN KEY ("event_id") REFERENCES "events"("id")
            );

            CREATE TABLE "vouchers" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "event_id" uuid NOT NULL,
                "name" varchar NOT NULL,
                "active" boolean NOT NULL DEFAULT true,
                "code_type" voucher_code_type_enum NOT NULL,
                "bulk_code_prefix" varchar NOT NULL DEFAULT '',
                "bulk_code_number" integer NOT NULL DEFAULT 0,
                "discount_type" voucher_discount_type_enum NOT NULL,
                "discount_value" decimal(10,2) NOT NULL,
                "quantity" integer NOT NULL,
                "is_unlimited" boolean NOT NULL,
                "max_order_per_user" integer NOT NULL,
                "min_qty_per_order" integer NOT NULL,
                "max_qty_per_order" integer NOT NULL,
                "discount_code" varchar NOT NULL,
                "showing_configs" jsonb,
                "is_all_showings" boolean NOT NULL,
                "status" voucher_status_enum NOT NULL DEFAULT 'ACTIVE',
                "start_time" TIMESTAMP NOT NULL,
                "end_time" TIMESTAMP NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "fk_voucher_event" FOREIGN KEY ("event_id") REFERENCES "events"("id")
            );
            
            CREATE TABLE "interests" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "user_id" varchar NOT NULL,
                "event_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "fk_interest_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE
            );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE IF EXISTS "vouchers";
            DROP TABLE IF EXISTS "questions";
            DROP TABLE IF EXISTS "members";
            DROP TABLE IF EXISTS "ticket_types";
            DROP TABLE IF EXISTS "shows";
            DROP TABLE IF EXISTS "settings";
            DROP TABLE IF EXISTS "payment_info";
            DROP TABLE IF EXISTS "events";
            DROP TABLE IF EXISTS "wards";
            DROP TABLE IF EXISTS "districts";
            DROP TABLE IF EXISTS "cities";
            DROP TABLE IF EXISTS "categories";
            DROP TABLE IF EXISTS "interests";
            
            DROP TYPE IF EXISTS "event_role_enum";
            DROP TYPE IF EXISTS "question_type_enum";
            DROP TYPE IF EXISTS "question_belongs_to_enum";
            DROP TYPE IF EXISTS "voucher_type_enum";
            DROP TYPE IF EXISTS "voucher_status_enum";
            DROP TYPE IF EXISTS "event_type_enum";
            DROP TYPE IF EXISTS "event_status_enum";
            DROP TYPE IF EXISTS "business_type_enum";
            DROP TYPE IF EXISTS "age_restriction_enum";
            DROP TYPE IF EXISTS "voucher_code_type_enum";
            DROP TYPE IF EXISTS "voucher_discount_type_enum";
        `);
  }
}

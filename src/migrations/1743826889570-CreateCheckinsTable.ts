import { MigrationInterface, QueryRunner } from 'typeorm';


export class CreateCheckinsTable1743826889570 implements MigrationInterface {
  name = 'CreateCheckinsTable1743826889570';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "attendee_check_ins"(
      "id" SERIAL PRIMARY KEY,
      "short_id" varchar(255) NOT NULL,
      "check_in_list_id" INTEGER NOT NULL,
      "ticket_type_id" INTEGER NOT NULL,
      "show_id" INTEGER NOT NULL,
      "attendee_id" INTEGER NOT NULL,
      "ip_address" inet NOT NULL,
      "deleted_at" TIMESTAMP,
      "created_at" TIMESTAMP DEFAULT now(),
      "updated_at" TIMESTAMP DEFAULT now(),
      "event_id" INTEGER NOT NULL
    );

      CREATE INDEX "attendee_check_ins_attendee_id_index" 
        ON "attendee_check_ins" USING btree("attendee_id");
      
      CREATE INDEX "attendee_check_ins_check_in_list_id_index" 
        ON "attendee_check_ins" USING btree("check_in_list_id");
      
      CREATE INDEX "attendee_check_ins_event_id_index" 
        ON "attendee_check_ins" USING btree("event_id");
      
      CREATE INDEX "attendee_check_ins_short_id_index" 
        ON "attendee_check_ins" USING btree("short_id");
      
      CREATE INDEX "attendee_check_ins_ticket_type_id_index" 
        ON "attendee_check_ins" USING btree("ticket_type_id");
      
      CREATE INDEX "idx_attendee_check_ins_attendee_id_check_in_list_id_deleted_at" 
        ON "attendee_check_ins" USING btree("attendee_id", "check_in_list_id")
    WHERE("deleted_at" IS NULL);

      CREATE TABLE "check_in_lists"(
      "id" SERIAL PRIMARY KEY,
      "short_id" varchar(255) NOT NULL,
      "name" varchar(100) NOT NULL,
      "description" text,
      "expires_at" TIMESTAMP,
      "activates_at" TIMESTAMP,
      "show_id" INTEGER NOT NULL,
      "event_id" INTEGER NOT NULL,
      "deleted_at" TIMESTAMP,
      "created_at" TIMESTAMP DEFAULT now(),
      "updated_at" TIMESTAMP DEFAULT now()
    );

      CREATE INDEX "check_in_lists_event_id_index" 
        ON "check_in_lists" USING btree("event_id");
      
      CREATE INDEX "check_in_lists_short_id_index" 
        ON "check_in_lists" USING btree("short_id");

      CREATE TABLE "ticket_check_in_lists"(
      "id" SERIAL PRIMARY KEY,
      "ticket_type_id" INTEGER NOT NULL,
      "check_in_list_id" INTEGER NOT NULL,
      "deleted_at" TIMESTAMP
    );

      CREATE INDEX "idx_ticket_check_in_lists_ticket_id_deleted_at" 
        ON "ticket_check_in_lists" USING btree("ticket_type_id", "check_in_list_id")
    WHERE("deleted_at" IS NULL);
      
      CREATE INDEX "ticket_check_in_lists_ticket_id_check_in_list_id_index" 
        ON "ticket_check_in_lists" USING btree("ticket_type_id", "check_in_list_id");

      ALTER TABLE "attendee_check_ins" 
        ADD CONSTRAINT "attendee_check_ins_attendee_id_foreign" 
        FOREIGN KEY("attendee_id") REFERENCES "attendees"("id") 
        ON DELETE CASCADE;

      ALTER TABLE "attendee_check_ins" 
        ADD CONSTRAINT "attendee_check_ins_check_in_list_id_foreign" 
        FOREIGN KEY("check_in_list_id") REFERENCES "check_in_lists"("id") 
        ON DELETE CASCADE;

      ALTER TABLE "attendee_check_ins" 
        ADD CONSTRAINT "attendee_check_ins_event_id_foreign" 
        FOREIGN KEY("event_id") REFERENCES "events"("id") 
        ON DELETE CASCADE;

      ALTER TABLE "attendee_check_ins" 
        ADD CONSTRAINT "attendee_check_ins_ticket_type_id_foreign" 
        FOREIGN KEY("ticket_type_id") REFERENCES "ticket_types"("id") 
        ON DELETE CASCADE;

      ALTER TABLE "check_in_lists" 
        ADD CONSTRAINT "check_in_lists_event_id_foreign" 
        FOREIGN KEY("event_id") REFERENCES "events"("id") 
        ON DELETE CASCADE;

      ALTER TABLE "ticket_check_in_lists" 
        ADD CONSTRAINT "ticket_check_in_lists_check_in_list_id_foreign" 
        FOREIGN KEY("check_in_list_id") REFERENCES "check_in_lists"("id") 
        ON DELETE CASCADE;

      ALTER TABLE "ticket_check_in_lists" 
        ADD CONSTRAINT "ticket_check_in_lists_ticket_type_id_foreign" 
        FOREIGN KEY("ticket_type_id") REFERENCES "ticket_types"("id") 
        ON DELETE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS
      "attendee_check_ins",
      "check_in_lists",
      "ticket_check_in_lists"
    CASCADE;  
    `);
  }
}
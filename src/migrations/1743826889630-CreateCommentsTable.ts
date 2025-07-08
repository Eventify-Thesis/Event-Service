import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCommentsTable1743826889630 implements MigrationInterface {
  name = 'CreateCommentsTable1743826889630';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      -- Create Comments table
      CREATE TABLE "comments" (
        "id" SERIAL PRIMARY KEY,
        "event_id" INTEGER NOT NULL,
        "user_id" VARCHAR(255) NOT NULL,
        "parent_id" INTEGER NULL,
        "content" TEXT NOT NULL,
        "is_edited" BOOLEAN DEFAULT false,
        "is_deleted" BOOLEAN DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Create foreign key for Comments to Event
      ALTER TABLE "comments" ADD CONSTRAINT "fk_comments_event" 
        FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE;

      -- Create foreign key for Comments to parent Comment (self-referencing)
      ALTER TABLE "comments" ADD CONSTRAINT "fk_comments_parent" 
        FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE CASCADE;

      -- Create indexes for performance
      CREATE INDEX "idx_comments_event_id" ON "comments" ("event_id");
      CREATE INDEX "idx_comments_user_id" ON "comments" ("user_id");
      CREATE INDEX "idx_comments_parent_id" ON "comments" ("parent_id");
      CREATE INDEX "idx_comments_created_at" ON "comments" ("created_at");
      CREATE INDEX "idx_comments_not_deleted" ON "comments" ("is_deleted") WHERE "is_deleted" = false;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      -- Drop indexes
      DROP INDEX IF EXISTS "idx_comments_not_deleted";
      DROP INDEX IF EXISTS "idx_comments_created_at";
      DROP INDEX IF EXISTS "idx_comments_parent_id";
      DROP INDEX IF EXISTS "idx_comments_user_id";
      DROP INDEX IF EXISTS "idx_comments_event_id";

      -- Drop Comments table and its foreign keys
      DROP TABLE IF EXISTS "comments" CASCADE;
    `);
  }
}

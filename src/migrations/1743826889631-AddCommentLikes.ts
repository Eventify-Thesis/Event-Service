import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCommentLikes1743826889631 implements MigrationInterface {
  name = 'AddCommentLikes1743826889631';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      -- Add like_count column to comments table
      ALTER TABLE "comments" ADD COLUMN "like_count" INTEGER DEFAULT 0;

      -- Create comment_likes table
      CREATE TABLE "comment_likes" (
        "id" SERIAL PRIMARY KEY,
        "comment_id" INTEGER NOT NULL,
        "user_id" VARCHAR(255) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "unique_user_comment_like" UNIQUE ("comment_id", "user_id")
      );

      -- Create foreign key for comment_likes to comments
      ALTER TABLE "comment_likes" ADD CONSTRAINT "fk_comment_likes_comment" 
        FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE CASCADE;

      -- Create indexes for performance
      CREATE INDEX "idx_comment_likes_comment_id" ON "comment_likes" ("comment_id");
      CREATE INDEX "idx_comment_likes_user_id" ON "comment_likes" ("user_id");
      CREATE INDEX "idx_comment_likes_created_at" ON "comment_likes" ("created_at");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      -- Drop the comment_likes table
      DROP TABLE "comment_likes";

      -- Remove like_count column from comments table
      ALTER TABLE "comments" DROP COLUMN "like_count";
    `);
  }
}

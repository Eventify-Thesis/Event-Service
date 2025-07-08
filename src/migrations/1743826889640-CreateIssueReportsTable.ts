import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIssueReportsTable1743826889640
  implements MigrationInterface
{
  name = 'CreateIssueReportsTable1743826889640';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      -- Create enum types for issue reports
      CREATE TYPE "issue_category_enum" AS ENUM ('bug', 'transaction', 'ui_ux', 'feature_request', 'account', 'other');
      CREATE TYPE "issue_status_enum" AS ENUM ('open', 'in_progress', 'resolved', 'closed');
      CREATE TYPE "issue_priority_enum" AS ENUM ('low', 'medium', 'high', 'urgent');

      -- Create issue_reports table
      CREATE TABLE "issue_reports" (
        "id" SERIAL PRIMARY KEY,
        "user_id" VARCHAR(255) NOT NULL,
        "title" VARCHAR(255) NOT NULL,
        "description" TEXT NOT NULL,
        "category" "issue_category_enum" NOT NULL DEFAULT 'other',
        "status" "issue_status_enum" NOT NULL DEFAULT 'open',
        "priority" "issue_priority_enum" NOT NULL DEFAULT 'medium',
        "image_urls" TEXT[] DEFAULT '{}',
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for performance
      CREATE INDEX "idx_issue_reports_user_id" ON "issue_reports" ("user_id");
      CREATE INDEX "idx_issue_reports_category" ON "issue_reports" ("category");
      CREATE INDEX "idx_issue_reports_status" ON "issue_reports" ("status");
      CREATE INDEX "idx_issue_reports_priority" ON "issue_reports" ("priority");
      CREATE INDEX "idx_issue_reports_created_at" ON "issue_reports" ("created_at");
      CREATE INDEX "idx_issue_reports_updated_at" ON "issue_reports" ("updated_at");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      -- Drop the issue_reports table
      DROP TABLE "issue_reports";

      -- Drop enum types
      DROP TYPE "issue_category_enum";
      DROP TYPE "issue_status_enum";
      DROP TYPE "issue_priority_enum";
    `);
  }
}

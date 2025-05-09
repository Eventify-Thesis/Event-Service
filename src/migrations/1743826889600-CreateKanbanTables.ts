import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateKanbanTables1743826889600 implements MigrationInterface {
  name = 'CreateKanbanTables1743826889600';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      -- Create KanbanBoard table
      CREATE TABLE "kanban_boards" (
        "id" SERIAL PRIMARY KEY,
        "event_id" int NOT NULL,
        "name" varchar(255) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Create foreign key for KanbanBoard to Event
      ALTER TABLE "kanban_boards" ADD CONSTRAINT "fk_kanban_boards_event" 
        FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE;

      -- Create KanbanColumn table
      CREATE TABLE "kanban_columns" (
        "id" SERIAL PRIMARY KEY,
        "board_id" INTEGER NOT NULL,
        "name" varchar(255) NOT NULL,
        "position" INTEGER NOT NULL,
        "color" varchar(255),
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Create foreign key for KanbanColumn to KanbanBoard
      ALTER TABLE "kanban_columns" ADD CONSTRAINT "fk_kanban_columns_board" 
        FOREIGN KEY ("board_id") REFERENCES "kanban_boards"("id") ON DELETE CASCADE;

      -- Create KanbanTask table
      CREATE TABLE "kanban_tasks" (
        "id" SERIAL PRIMARY KEY,
        "column_id" INTEGER NOT NULL,
        "title" varchar(255) NOT NULL,
        "description" text NULL,
        "position" INTEGER NOT NULL,
        "priority" varchar(50) DEFAULT 'medium',
        "labels" jsonb DEFAULT '{}',
        "due_date" TIMESTAMP NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Create foreign key for KanbanTask to KanbanColumn
      ALTER TABLE "kanban_tasks" ADD CONSTRAINT "fk_kanban_tasks_column" 
        FOREIGN KEY ("column_id") REFERENCES "kanban_columns"("id") ON DELETE CASCADE;

      -- Create TaskAssignment table
      CREATE TABLE "task_assignments" (
        "id" SERIAL PRIMARY KEY,
        "task_id" INTEGER NOT NULL,
        "member_id" INTEGER NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Create foreign key for TaskAssignment to KanbanTask
      ALTER TABLE "task_assignments" ADD CONSTRAINT "fk_task_assignments_task" 
        FOREIGN KEY ("task_id") REFERENCES "kanban_tasks"("id") ON DELETE CASCADE;

      -- Create foreign key for TaskAssignment to Member
      ALTER TABLE "task_assignments" ADD CONSTRAINT "fk_task_assignments_member" 
        FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      -- Drop TaskAssignment table and its foreign keys
      DROP TABLE IF EXISTS "task_assignments" CASCADE;

      -- Drop KanbanTask table and its foreign key
      DROP TABLE IF EXISTS "kanban_tasks" CASCADE;

      -- Drop KanbanColumn table and its foreign key
      DROP TABLE IF EXISTS "kanban_columns" CASCADE;

      -- Drop KanbanBoard table and its foreign key
      DROP TABLE IF EXISTS "kanban_boards" CASCADE;
    `);
  }
}

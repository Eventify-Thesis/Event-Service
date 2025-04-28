import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveAttendeeTableConstraint1743826889561 implements MigrationInterface {
  name = 'RemoveAttendeeTableConstraint1743826889561';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE attendees
        ALTER COLUMN order_id DROP NOT NULL;
        ALTER TABLE attendees
        ALTER COLUMN show_id DROP NOT NULL;

        
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    `);
  }
}

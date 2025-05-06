import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixSmallThings1743826889560 implements MigrationInterface {
  name = 'FixSmallThings1743826889560';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE attendees
        ADD COLUMN public_id VARCHAR(255);

        ALTER TABLE attendees
        ADD COLUMN short_id VARCHAR(255);

        ALTER TABLE orders
        ADD COLUMN public_id VARCHAR(255);
      
        ALTER TABLE orders
        ADD COLUMN short_id VARCHAR(255);

        ALTER TABLE events
        ADD COLUMN public_id VARCHAR(255);

        ALTER TABLE events
        ADD COLUMN short_id VARCHAR(255);
   
        ALTER TABLE booking_answers
        ADD COLUMN attendee_id INTEGER;
        
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE events
        DROP COLUMN short_id;

        ALTER TABLE events
        DROP COLUMN public_id;

        ALTER TABLE orders
        DROP COLUMN short_id;

        ALTER TABLE orders
        DROP COLUMN public_id;

        ALTER TABLE attendees
        DROP COLUMN short_id;

        ALTER TABLE attendees
        DROP COLUMN public_id;

    `);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLatLngColumnsToEventTable1743826889620
  implements MigrationInterface
{
  name = 'AddLatLngColumnsToEventTable1743826889620';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE events
        ADD COLUMN latitude DOUBLE PRECISION,
        ADD COLUMN longitude DOUBLE PRECISION,
        ADD COLUMN formatted_address VARCHAR,
        ADD COLUMN place_id VARCHAR;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE events DROP COLUMN latitude;
      ALTER TABLE events DROP COLUMN longitude;
      ALTER TABLE events DROP COLUMN formatted_address;
      ALTER TABLE events DROP COLUMN place_id;
    `);
  }
}

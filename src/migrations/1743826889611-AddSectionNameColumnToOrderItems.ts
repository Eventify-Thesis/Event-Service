import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSectionNameColumnToOrderItems1743826889611
  implements MigrationInterface
{
  name = 'AddSectionNameColumnToOrderItems1743826889611';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE order_items ADD COLUMN section_name VARCHAR;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE order_items DROP COLUMN section_name;
    `);
  }
}

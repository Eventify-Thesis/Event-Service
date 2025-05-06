import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUniqueConstraint1743826889580 implements MigrationInterface {
  name = 'RemoveUniqueConstraint1743826889580';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE shows
        DROP CONSTRAINT shows_event_id_key;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
     
    `);
  }
}

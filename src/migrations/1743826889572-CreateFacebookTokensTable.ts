import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFacebookTokensTable1743826889572 implements MigrationInterface {
  name = 'CreateFacebookTokensTable1743826889572';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE facebook_tokens (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL,
        long_lived_user_token VARCHAR(500) NOT NULL,
        page_tokens JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        token_expires_at TIMESTAMP
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE facebook_tokens;
    `);
  }
}

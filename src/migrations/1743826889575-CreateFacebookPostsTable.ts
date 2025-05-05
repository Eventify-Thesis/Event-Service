import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFacebookPostsTable1743826889575 implements MigrationInterface {
  name = 'CreateFacebookPostsTable1743826889575';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE facebook_posts (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL,
        event_id VARCHAR NOT NULL,
        page_id VARCHAR NOT NULL,
        post_id VARCHAR NOT NULL,
        message TEXT NOT NULL,
        image_urls JSONB,
        scheduled_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE facebook_tokens;
    `);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMessagesTable1743826889558 implements MigrationInterface {
  name = 'CreateMessagesTable1743826889558';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE messages (
    id             SERIAL PRIMARY KEY,
    event_id        INTEGER      NOT NULL,
    subject         VARCHAR(255) NOT NULL,
    message         TEXT         NOT NULL,
    type            VARCHAR(40)  NOT NULL,
    recipient_ids   JSONB,
    sent_at         TIMESTAMP,
    sent_by_user_id VARCHAR       NOT NULL,
    attendee_ids    JSONB,
    ticket_type_ids JSONB,
    order_id        INTEGER,
    status          VARCHAR(20)  NOT NULL,
    send_data       JSONB,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW(),
    deleted_at      TIMESTAMP
);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      drop table messages;
    `);
  }
}

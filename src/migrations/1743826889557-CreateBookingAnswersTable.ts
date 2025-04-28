import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBookingAnswersAndAttendees1743826889557
  implements MigrationInterface {
  name = 'CreateBookingAnswersAndAttendees1743826889557';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      -- pg_trgm is needed for trigram indexes
      CREATE EXTENSION IF NOT EXISTS pg_trgm;

      /* ────────────────────────────────
       *  booking_answers
       * ──────────────────────────────── */
      CREATE TABLE booking_answers (
        id             SERIAL PRIMARY KEY,
        event_id       INTEGER  NOT NULL,
        show_id        INTEGER  NOT NULL,
        order_id       INTEGER  NOT NULL,
        question_id    INTEGER  NOT NULL,
        ticket_type_id INTEGER,
        user_id        VARCHAR,
        answer         JSONB    NOT NULL,
        created_at     TIMESTAMP DEFAULT NOW(),
        updated_at     TIMESTAMP DEFAULT NOW(),
        CONSTRAINT fk_booking_answers_order
          FOREIGN KEY (order_id)    REFERENCES orders(id)     ON DELETE CASCADE,
        CONSTRAINT fk_booking_answers_question
          FOREIGN KEY (question_id) REFERENCES questions(id)  ON DELETE CASCADE
      );

      /* ────────────────────────────────
       *  attendees
       * ──────────────────────────────── */
      CREATE TABLE attendees (
        id             SERIAL PRIMARY KEY,
        first_name     VARCHAR(255)    NOT NULL DEFAULT '',
        last_name      VARCHAR(255)    NOT NULL DEFAULT '',
        email          VARCHAR(255)    NOT NULL,
        order_id       INTEGER         NOT NULL,
        seat_id        VARCHAR,
        seat_number    INTEGER,
        row_label      VARCHAR,
        ticket_type_id INTEGER         NOT NULL,
        show_id        INTEGER         NOT NULL,
        event_id       INTEGER         NOT NULL,
        qr_code        VARCHAR,
        status         VARCHAR(20),
        checked_in_by  VARCHAR,
        checked_in_at  TIMESTAMP,
        created_at     TIMESTAMP       DEFAULT NOW(),
        updated_at     TIMESTAMP       DEFAULT NOW(),
        deleted_at     TIMESTAMP,
        checked_out_by VARCHAR,
        checked_out_at TIMESTAMP,
        CONSTRAINT fk_attendees_order_id
          FOREIGN KEY (order_id) REFERENCES orders(id)  ON DELETE CASCADE,
        CONSTRAINT fk_attendees_event_id
          FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
      );

      /* ────────────────  indexes  ──────────────── */

      -- trigram indexes for fast ILIKE searches
      CREATE INDEX IF NOT EXISTS idx_attendees_first_name_trgm
        ON attendees USING gin (first_name gin_trgm_ops);

      CREATE INDEX IF NOT EXISTS idx_attendees_last_name_trgm
        ON attendees USING gin (last_name gin_trgm_ops);

      CREATE INDEX IF NOT EXISTS idx_attendees_email_trgm
        ON attendees USING gin (email gin_trgm_ops);

      -- booking_answers lookup
      CREATE INDEX idx_booking_answers_order_id
        ON booking_answers(order_id);

      CREATE INDEX idx_booking_answers_question_id
        ON booking_answers(question_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_booking_answers_question_id;
      DROP INDEX IF EXISTS idx_booking_answers_order_id;
      DROP INDEX IF EXISTS idx_attendees_email_trgm;
      DROP INDEX IF EXISTS idx_attendees_last_name_trgm;
      DROP INDEX IF EXISTS idx_attendees_first_name_trgm;

      DROP TABLE IF EXISTS booking_answers;
      DROP TABLE IF EXISTS attendees;
    `);
  }
}

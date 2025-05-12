import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQuizTables1743826889610 implements MigrationInterface {
  name = 'CreateQuizTables1743826889610';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE quizzes (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        show_id INTEGER NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
        title VARCHAR NOT NULL,
        is_completed BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      );
      
      CREATE TABLE quiz_questions (
        id SERIAL PRIMARY KEY,
        quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
        text VARCHAR NOT NULL,
        options JSONB NOT NULL,
        correct_option INTEGER NOT NULL,
        time_limit INTEGER DEFAULT 60,
        explanation VARCHAR,
        created_at TIMESTAMP NOT NULL DEFAULT now()
      );
      
      CREATE TABLE quiz_answers (
        id SERIAL PRIMARY KEY,
        quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
        question_id INTEGER NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
        user_id VARCHAR NOT NULL,
        selected_option INTEGER NOT NULL,
        is_correct BOOLEAN NOT NULL,
        time_taken FLOAT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT now()
      );
      
      CREATE TABLE quiz_results (
        id SERIAL PRIMARY KEY,
        quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
        user_id VARCHAR NOT NULL,
        score INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        correct_answers INTEGER NOT NULL,
        time_taken FLOAT NOT NULL,
        is_passed BOOLEAN NOT NULL,
        completed_at TIMESTAMP NOT NULL DEFAULT now()
      );
      
      CREATE INDEX idx_quiz_show_id ON quizzes(show_id);
      CREATE INDEX idx_quiz_event_id ON quizzes(event_id);
      CREATE INDEX idx_question_quiz_id ON quiz_questions(quiz_id);
      CREATE INDEX idx_answer_question_id ON quiz_answers(question_id);
      CREATE INDEX idx_answer_user_id ON quiz_answers(user_id);
      CREATE INDEX idx_result_quiz_id ON quiz_results(quiz_id);
      CREATE INDEX idx_result_user_id ON quiz_results(user_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE quiz_results;
      DROP TABLE quiz_answers; 
      DROP TABLE quiz_questions;
      DROP TABLE quizzes;
    `);
  }
}
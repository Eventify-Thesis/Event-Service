import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { QuizQuestion } from './quiz-question.entity';

@Entity('quiz_answers')
export class QuizAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => QuizQuestion, (question) => question.answers)
  question: QuizQuestion;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'selected_option' })
  selectedOption: number;

  @Column({ name: 'is_correct' })
  isCorrect: boolean;

  @Column({ name: 'time_taken' })
  timeTaken: number; // in seconds
}
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { QuizQuestion } from './quiz-question.entity';

@Entity('quiz_answers')
export class QuizAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => QuizQuestion)
  question: QuizQuestion;

  @Column()
  userId: string;

  @Column()
  selectedOption: number;

  @Column()
  isCorrect: boolean;

  @Column()
  score: number;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  answeredAt: Date;
}
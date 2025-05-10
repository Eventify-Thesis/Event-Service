import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Quiz } from './quiz.entity';

@Entity('quiz_results')
export class QuizResult {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Quiz, (quiz) => quiz.results)
  quiz: Quiz;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  score: number;

  @Column({ name: 'total_questions' })
  totalQuestions: number;

  @Column({ name: 'correct_answers' })
  correctAnswers: number;

  @Column({ type: 'float' })
  timeTaken: number;

  @Column({ name: 'is_passed', default: false })
  isPassed: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  completedAt: Date;
}

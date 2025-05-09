import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Quiz } from './quiz.entity';

@Entity('quiz_results')
export class QuizResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Quiz, (quiz) => quiz.results)
  quiz: Quiz;

  @Column()
  userId: string;

  @Column()
  score: number;

  @Column()
  totalQuestions: number;

  @Column()
  correctAnswers: number;

  @Column({ type: 'float' })
  timeTaken: number;

  @Column({ default: false })
  isPassed: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  completedAt: Date;
}

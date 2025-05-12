import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn } from 'typeorm';
import { Quiz } from './quiz.entity';

@Entity('quiz_results')
export class QuizResult {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Quiz, (quiz) => quiz.results)
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  score: number;

  @Column({ name: 'total_questions' })
  totalQuestions: number;

  @Column({ name: 'correct_answers' })
  correctAnswers: number;

  @Column({ type: 'float', name: 'time_taken' })
  timeTaken: number;

  @Column({ type: 'timestamp', name: 'completed_at', default: () => 'CURRENT_TIMESTAMP' })
  completedAt: Date;
}

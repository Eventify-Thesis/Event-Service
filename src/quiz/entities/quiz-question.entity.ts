import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Quiz } from './quiz.entity';

@Entity('quiz_questions')
export class QuizQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'quiz_id' })
  quizId: string;

  @ManyToOne(() => Quiz, { nullable: false })
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;

  @Column()
  text: string;

  @Column('jsonb')
  options: { id: number; text: string }[];

  @Column()
  correctOption: number;

  @Column({ default: 30 })
  timeLimit: number;
}
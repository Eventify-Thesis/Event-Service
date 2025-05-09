import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Show } from '../../event/entities/show.entity';
import { QuizQuestion } from './quiz-question.entity';
import { QuizResult } from './quiz-result.entity';

@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'show_id' })
  showId: number;

  @ManyToOne(() => Show, { nullable: false })
  @JoinColumn({ name: 'show_id' })
  show: Show;

  @Column()
  title: string;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ default: 70 })
  passingScore: number;

  @Column({ default: 1 })
  maxAttempts: number;

  @OneToMany(() => QuizQuestion, question => question.quiz)
  questions: QuizQuestion[];

  @OneToMany(() => QuizResult, result => result.quiz)
  results: QuizResult[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

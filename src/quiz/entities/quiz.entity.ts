import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Show } from '../../event/entities/show.entity';
import { QuizQuestion } from './quiz-question.entity';
import { QuizResult } from './quiz-result.entity';

@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'show_id' })
  showId: number;

  @ManyToOne(() => Show, { nullable: false })
  @JoinColumn({ name: 'show_id' })
  show: Show;

  @Column()
  title: string;

  @Column({name: 'is_completed', default: false })
  isCompleted: boolean;

  @Column({name: 'passing_score', default: 70 })
  passingScore: number;

  @Column({name: 'max_attempts', default: 1 })
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

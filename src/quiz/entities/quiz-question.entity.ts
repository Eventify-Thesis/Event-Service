import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Quiz } from './quiz.entity';
import { QuizAnswer } from './quiz-answer.entity';

@Entity('quiz_questions')
export class QuizQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Quiz, (quiz) => quiz.questions)
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;

  @Column()
  text: string;

  @Column('jsonb')
  options: { id: number; text: string }[];

  @Column({ name: 'correct_option' })
  correctOption: number;

  @Column({ name: 'time_limit', nullable: true })
  timeLimit?: number;

  @OneToMany(() => QuizAnswer, (answer) => answer.question)
  answers: QuizAnswer[];
}
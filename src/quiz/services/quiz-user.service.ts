import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizAnswer } from '../entities/quiz-answer.entity';
import { QuizQuestion } from '../entities/quiz-question.entity';
import { QuizResult } from '../entities/quiz-result.entity';
import { Quiz } from '../entities/quiz.entity';
import { QuizService } from './quiz.service';
import { SubmitAnswerDto } from '../dto/submit-answer.dto';
import { QuizRedisService } from './quiz-redis.service';

@Injectable()
export class QuizUserService {
  constructor(
    private readonly quizService: QuizService,
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
    @InjectRepository(QuizQuestion)
    private readonly quizQuestionRepository: Repository<QuizQuestion>,
    @InjectRepository(QuizAnswer)
    private readonly quizAnswerRepository: Repository<QuizAnswer>,
    @InjectRepository(QuizResult)
    private readonly quizResultRepository: Repository<QuizResult>,
    private readonly quizRedisService: QuizRedisService,
  ) {}

  async joinQuiz(
    code: string,
    userId: string,
    username: string,
  ): Promise<{ success: boolean; message: string }> {
    // Add user to Redis-based quiz state
    return await this.quizRedisService.joinQuiz(code, userId, username);
  }

  async findByShow(showId: number) {
    return this.quizRepository.findOne({
      where: { showId },
      relations: ['questions'],
    });
  }

  async getCurrentQuestion(code: string, questionIndex: number) {
    const quizState = await this.quizRedisService.getQuizState(code);

    if (!quizState || questionIndex >= quizState.questions.length) {
      return { success: false, message: 'Question not found' };
    }

    const question = quizState.questions[questionIndex];
    // Don't expose the correct answer
    const { correctOption, ...safeQuestion } = question;

    return {
      success: true,
      question: {
        ...safeQuestion,
        index: questionIndex,
        isLast: questionIndex === quizState.questions.length - 1,
      },
    };
  }

  async submitAnswer(dto: SubmitAnswerDto, userId: string) {
    try {
      const result = await this.quizRedisService.recordUserAnswer(
        userId,
        dto.code,
        dto.answerQuestionIndex,
        dto.selectedOption,
        dto.timeTaken || 0,
      );
  
      return {
        success: true,
        result,
      };
    } catch (error) {
      // Handle duplicate answer error
      if (error instanceof BadRequestException) {
        return {
          success: false,
          message: error.message,
        };
      }
      // Optionally rethrow or handle other errors
      throw error;
    }
  }

  async getQuizProgress(code: string, userId: string) {
    const userQuizState = await this.quizRedisService.getUserState(
      userId,
      code,
    );

    const quizState = await this.quizRedisService.getQuizState(code);

    return {
      success: true,
      totalQuestions: quizState?.questions.length,
      answeredQuestions: userQuizState?.answers.length,
      completionRate:
        quizState?.questions.length > 0
          ? (userQuizState?.answers.length / quizState?.questions.length) * 100
          : 0,
    };
  }

  async getLeaderboardSnapshot(quizId: number, limit = 10) {
    const leaderboard = await this.quizAnswerRepository
      .createQueryBuilder('answer')
      .select('answer.userId', 'userId')
      .addSelect(
        'SUM(CASE WHEN answer.isCorrect THEN 1 ELSE 0 END)',
        'correctAnswers',
      )
      .addSelect('COUNT(answer.id)', 'totalAnswers')
      .addSelect('SUM(CAST(answer.timeTaken AS FLOAT))', 'totalTime')
      .innerJoin('answer.question', 'question')
      .where('question.quizId = :quizId', { quizId })
      .groupBy('answer.userId')
      .orderBy('correctAnswers', 'DESC')
      .addOrderBy('totalTime', 'ASC')
      .limit(limit)
      .getRawMany();

    return {
      success: true,
      leaderboard,
    };
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Quiz } from '../entities/quiz.entity';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { QuizRepository } from '../repositories/quiz.repository';
import { CreateQuizDto } from '../dto/create-quiz.dto';
import { Show } from '../../event/entities/show.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SubmitQuizDto } from '../dto/submit-quiz.dto';
import { QuizAnswer } from '../entities/quiz-answer.entity';
import { QuizQuestion } from '../entities/quiz-question.entity';
import { UpdateQuizDto } from '../dto/update-quiz.dto';
import { QuizResult } from '../entities/quiz-result.entity';
import { SubmitAnswerDto } from '../dto/submit-answer.dto';
import { CreateQuizQuestionDto } from '../dto/create-quiz-question.dto';
import { UpdateQuizQuestionDto } from '../dto/update-quiz-question.dto';
import { QuizListQuery } from '../dto/quiz.query';

@Injectable()
export class QuizService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Quiz)
    private readonly quizRepository: QuizRepository,
    @InjectRepository(Show)
    private readonly showRepository: Repository<Show>,
    @InjectRepository(QuizQuestion)
    private readonly quizQuestionRepository: Repository<QuizQuestion>,
    @InjectRepository(QuizAnswer)
    private readonly quizAnswerRepository: Repository<QuizAnswer>,
    @InjectRepository(QuizResult)
    private readonly quizResultRepository: Repository<QuizResult>,
  ) {
    this.genAI = new GoogleGenerativeAI(
      this.configService.get('GEMINI_API_KEY'),
    );
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  async generateQuizQuestions(
    topic: string,
    difficulty: string = 'medium',
    count: number = 5,
  ) {
    const prompt = `Generate ${count} ${difficulty} difficulty quiz questions about ${topic}.
      Format as JSON array with:
      {
        "id": "unique id",
        "text": "question text",
        "options": ["option1", "option2", "option3", "option4"],
        "correctOption": index (0-3),
        "explanation": "brief explanation"
      }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const parsedResponse = this.parseGeminiResponse(text);

      parsedResponse.forEach((question) => {
        question.options = question.options.map((option, index) => ({
          id: index,
          text: option,
        }));
      });
      return parsedResponse;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate quiz questions');
    }
  }

  private parseGeminiResponse(text: string) {
    try {
      // Extract JSON from markdown code block if present
      const jsonStart = text.indexOf('[');
      const jsonEnd = text.lastIndexOf(']') + 1;
      const jsonString = text.slice(jsonStart, jsonEnd);
      return JSON.parse(jsonString);
    } catch (e) {
      console.error('Failed to parse Gemini response:', e);
      throw new Error('Invalid response format from Gemini');
    }
  }

  async create(eventId: number, createQuizDto: CreateQuizDto) {
    const quiz = this.quizRepository.create({
      eventId,
      ...createQuizDto,
    });

    return this.quizRepository.save(quiz);
  }

  async findAll(query: QuizListQuery) {
    const queryBuilder = this.quizRepository
      .createQueryBuilder('quiz')
      .leftJoinAndSelect('quiz.questions', 'questions')
      .leftJoinAndSelect('quiz.show', 'show')
      .groupBy('quiz.id')
      .addGroupBy('show.id')
      .addGroupBy('questions.id')
      .orderBy('quiz.createdAt', 'DESC');

    if (query.eventId) {
      queryBuilder.andWhere('quiz.eventId = :eventId', {
        eventId: query.eventId,
      });
    }

    if (query.showId) {
      queryBuilder.andWhere('quiz.showId = :showId', { showId: query.showId });
    }

    if (query.keyword) {
      queryBuilder.andWhere('quiz.title ILIKE :keyword', {
        keyword: `%${query.keyword}%`,
      });
    }

    const [docs] = await Promise.all([
      queryBuilder
        .skip((query.page - 1) * query.limit)
        .take(query.limit)
        .getRawAndEntities(),
      queryBuilder.getCount(),
    ]);

    const totalDocs = await queryBuilder.getCount();

    const totalPages = Math.ceil(totalDocs / query.limit);
    const pagingCounter = (query.page - 1) * query.limit + 1;

    return {
      docs: docs.entities.map((entity, i) => ({
        ...entity,
        checkedInAttendees: parseInt(docs.raw[i].checkedInAttendees) || 0,
        totalAttendees: parseInt(docs.raw[i].totalAttendees) || 0,
      })),
      totalDocs,
      limit: query.limit,
      totalPages,
      page: query.page,
      pagingCounter,
      hasPrevPage: query.page > 1,
      hasNextPage: query.page < totalPages,
      prevPage: query.page > 1 ? query.page - 1 : null,
      nextPage: query.page < totalPages ? query.page + 1 : null,
    };
  }

  async findById(id: number): Promise<Quiz> {
    return this.quizRepository.findOne({
      where: { id },
      relations: ['questions', 'results'],
    });
  }

  async getResults(showId: number, userId: string) {
    return this.quizAnswerRepository.find({
      where: {
        question: { quiz: { show: { id: showId } } },
        userId: userId,
      },
      relations: ['question'],
    });
  }

  async getLeaderboard(showId: number) {
    return this.quizAnswerRepository
      .createQueryBuilder('answer')
      .select('answer.userId', 'userId')
      .addSelect('SUM(answer.score)', 'totalScore')
      .innerJoin('answer.question', 'question')
      .innerJoin('question.quiz', 'quiz')
      .where('quiz.showId = :showId', { showId })
      .groupBy('answer.userId')
      .orderBy('totalScore', 'DESC')
      .limit(10)
      .getRawMany();
  }

  async update(quizId: number, updateQuizDto: UpdateQuizDto) {
    await this.quizRepository.update(quizId, updateQuizDto);
    return this.quizRepository.findOneBy({ id: quizId });
  }

  async updateStatus(quizId: number, isCompleted: boolean) {
    return this.quizRepository.update(quizId, { isCompleted });
  }

  async delete(quizId: number) {
    await this.quizRepository.softDelete(quizId);
    return { deleted: true };
  }

  async getQuizAnalytics(quizId: number) {
    const [answers, stats] = await Promise.all([
      this.quizAnswerRepository.find({
        where: { question: { quiz: { id: quizId } } },
        relations: ['question'],
      }),
      this.quizAnswerRepository
        .createQueryBuilder('answer')
        .select('COUNT(answer.id)', 'totalAnswers')
        .addSelect('AVG(answer.score)', 'averageScore')
        .innerJoin('answer.question', 'question')
        .where('question.quizId = :quizId', { quizId })
        .getRawOne(),
    ]);

    return {
      stats,
      answers,
    };
  }

  async getQuizResults(quizId: number, userId?: string) {
    const where: any = { quiz: { id: quizId } };
    if (userId) where.userId = userId;

    return this.quizResultRepository.find({
      where,
      order: { completedAt: 'DESC' },
    });
  }

  async createQuestion(quizId: number, questionData: CreateQuizQuestionDto) {
    const question = this.quizQuestionRepository.create({
      ...questionData,
      quizId,
    });
    return this.quizQuestionRepository.save(question);
  }

  async getQuestions(quizId: number) {
    return this.quizQuestionRepository.find({
      where: { quiz: { id: quizId } },
    });
  }

  async getQuestion(questionId: number) {
    return this.quizQuestionRepository.findOne({ where: { id: questionId } });
  }

  async updateQuestion(
    quizId: number,
    questionId: number,
    questionData: UpdateQuizQuestionDto,
  ) {
    const question = await this.quizQuestionRepository.findOne({
      where: { id: questionId },
    });
    return this.quizQuestionRepository.update(questionId, questionData);
  }

  async deleteQuestion(questionId: number) {
    return this.quizQuestionRepository.delete(questionId);
  }
}

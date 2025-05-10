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
    private readonly quizResultRepository: Repository<QuizResult>
  ) {
    this.genAI = new GoogleGenerativeAI(this.configService.get('GEMINI_API_KEY'));
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
      return this.parseGeminiResponse(text);
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

  async create(createQuizDto: CreateQuizDto) {
    const show = await this.showRepository.findOne({
      where: { id: createQuizDto.showId }
    });
    
    const quiz = this.quizRepository.create({
      show,
      questions: createQuizDto.questions
    });

    return this.quizRepository.save(quiz);
  }

  async findByShow(showId: number) {
    return this.quizRepository.find({
      where: { show: { id: showId } },
      relations: ['questions']
    });
  }

  async findById(id: number): Promise<Quiz> {
    return this.quizRepository.findOne({ 
      where: { id },
      relations: ['questions', 'results'] 
    });
  }

  async submitAnswer(questionId: number, selectedOption: number, userId: string, timeTaken: number) {
    const question = await this.quizQuestionRepository.findOne({
      where: { id: questionId },
      relations: ['quiz']
    });

    const isCorrect = selectedOption === question.correctOption;
    const score = isCorrect ? this.calculateScore(question.timeLimit, timeTaken) : 0;

    await this.quizAnswerRepository.save({
      question,
      user: { id: userId },
      selectedOption,
      isCorrect,
      score,
      timeTaken
    });

    return { isCorrect, score };
  }

  async getResults(showId: number, userId: string) {
    return this.quizAnswerRepository.find({
      where: {
        question: { quiz: { show: { id: showId } } },
        userId: userId
      },
      relations: ['question']
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

  async submitQuiz(submitQuizDto: SubmitQuizDto, userId: string) {
    const quiz = await this.quizRepository.findOne({
      where: { id: submitQuizDto.quizId },
      relations: ['questions']
    });

    // Calculate total score
    let totalScore = 0;
    const answers = [];

    for (const answer of submitQuizDto.answers) {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      const isCorrect = answer.selectedOption === question.correctOption;
      const score = isCorrect ? this.calculateScore(question.timeLimit, answer.timeTaken) : 0;
      totalScore += score;

      answers.push({
        question,
        user: { id: userId },
        selectedOption: answer.selectedOption,
        isCorrect,
        score,
        timeTaken: answer.timeTaken
      });
    }

    // Save all answers
    await this.quizAnswerRepository.save(answers);

    // Mark quiz as completed if passing score achieved
    if (totalScore >= quiz.passingScore) {
      await this.quizRepository.update(quiz.id, { isCompleted: true });
    }

    return {
      totalScore,
      isCompleted: totalScore >= quiz.passingScore,
      passingScore: quiz.passingScore
    };
  }

  private calculateScore(timeLimit: number, timeTaken: number): number {
    // Calculate score based on speed (faster = higher score)
    const timeRatio = Math.max(0, (timeLimit - timeTaken) / timeLimit);
    return Math.floor(100 * (0.5 + 0.5 * timeRatio)); // Base 50 + up to 50 bonus for speed
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
        relations: ['question', 'user']
      }),
      this.quizAnswerRepository
        .createQueryBuilder('answer')
        .select('COUNT(answer.id)', 'totalAnswers')
        .addSelect('AVG(answer.score)', 'averageScore')
        .innerJoin('answer.question', 'question')
        .where('question.quizId = :quizId', { quizId })
        .getRawOne()
    ]);
  
    return {
      stats,
      answers
    };
  }

  async submitQuizAnswers(quizId: number, userId: string, answers: SubmitAnswerDto[]) {
    const previousAttempts = await this.quizResultRepository.count({ 
      where: { quiz: { id: quizId }, userId }
    });
    
    const quiz = await this.quizRepository.findOneBy({ id: quizId });
    if (previousAttempts >= quiz.maxAttempts) {
      throw new BadRequestException('Maximum attempts reached');
    }

    // Calculate score
    const questions = await this.quizQuestionRepository.find({ where: { quiz: { id: quizId } } });
    const totalQuestions = questions.length;
    let correctAnswers = 0;
    
    // Save answers and check correctness
    for (const answer of answers) {
      const question = questions.find(q => q.id === answer.questionId);
      const isCorrect = question?.correctOption === answer.selectedOption;
      
      if (isCorrect) correctAnswers++;
      
      await this.quizAnswerRepository.save({
        question: { id: answer.questionId },
        userId,
        selectedOption: answer.selectedOption,
        isCorrect,
        timeTaken: answer.timeTaken
      });
    }
    
    // Calculate score and pass status
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const isPassed = score >= quiz.passingScore;
    
    // Save quiz result
    const result = await this.quizResultRepository.save({
      quiz: { id: quizId },
      userId,
      score,
      totalQuestions,
      correctAnswers,
      timeTaken: answers.reduce((sum, a) => sum + a.timeTaken, 0),
      isPassed
    });
    
    return result;
  }

  async getQuizResults(quizId: number, userId?: string) {
    const where: any = { quiz: { id: quizId } };
    if (userId) where.userId = userId;
    
    return this.quizResultRepository.find({ 
      where,
      order: { completedAt: 'DESC' } 
    });
  }
}
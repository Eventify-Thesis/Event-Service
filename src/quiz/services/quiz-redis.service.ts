import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { randomBytes } from 'crypto';
import { QuizQuestion } from '../entities/quiz-question.entity';
import { DataSource } from 'typeorm';
import { RedisService } from '../../redis/redis.service';

export interface QuizGameState {
  quizId: number;
  currentQuestionIndex: number;
  startTime: number;
  endTime?: number;
  isActive: boolean;
  currentQuestionStartTime: number;
  participants: {
    userId: string;
    username?: string;
    score: number;
    answerQuestionIndex: number;
    selectedOption: number;
    questionsAnswered: number;
    lastActive: number;
  }[];
  questions: QuizQuestion[];
}

export interface UserGameState {
  userId: string;
  quizId: number;
  currentQuestionIndex: number;
  questionsAnswered: number;
  score: number;
  answers: {
    questionId: number;
    selectedOption: number;
    isCorrect: boolean;
    timeTaken: number;
  }[];
}

@Injectable()
export class QuizRedisService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
  ) {}

  // Join code methods
  private getJoinCodeKey(code: string): string {
    return `join:code:${code}`;
  }

  /**
   * Generate a random 6-digit code for quiz joining
   * @param quizId The quiz ID to associate the code with
   * @param expirySeconds Time until code expires in seconds (default: 6 hours)
   * @returns Object containing the generated code and expiry time
   */
  async generateQuizJoinCode(
    quizId: number,
    expirySeconds = 21600,
  ): Promise<{ code: string; expiresAt: string }> {
    // console.log('Redis connection config:', {
    //   host: this.cacheManager.store.getClient().options.host,
    //   port: this.cacheManager.store.getClient().options.port,
    //   db: this.cacheManager.store.getClient().options.db,
    // });

    // Generate a new 6-digit code (ensuring it's a string and has leading zeros if needed)
    let code: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      // Generate a random number between 0-999999 and format as 6 digits
      const randomNum = Math.floor(Math.random() * 1000000);
      code = randomNum.toString().padStart(6, '0');

      // Check if this code already exists in Redis
      const exists = await this.redisService.get(this.getJoinCodeKey(code));
      if (!exists) break;

      attempts++;
    } while (attempts < maxAttempts);

    // If we couldn't generate a unique code after maxAttempts, use a more robust method
    if (attempts >= maxAttempts) {
      const randomBytesBuffer = randomBytes(3); // 3 bytes = 6 hex characters
      const randomNum =
        parseInt(randomBytesBuffer.toString('hex'), 16) % 1000000;
      code = randomNum.toString().padStart(6, '0');
    }
    // Load the quiz-questions and save it into redis.

    const quizQuestions = await this.dataSource
      .createQueryBuilder()
      .select('quiz_questions')
      .from(QuizQuestion, 'quiz_questions')
      .where('quiz_questions.quiz_id = :quizId', { quizId })
      .getMany();

    await this.redisService.set(
      this.getJoinCodeKey(code),
      JSON.stringify({
        quizId,
        questions: quizQuestions,
        participants: [],
        currentQuestionIndex: 0,
        isActive: false,
      }),
      expirySeconds * 1000,
    );

    // Return the code and expiry time
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expirySeconds);

    return {
      code,
      expiresAt: expiresAt.toISOString(),
    };
  }

  /**
   * Verify a join code and return the associated quiz ID if valid
   * @param code The join code to verify
   * @returns Object indicating if the code is valid and associated quiz ID
   */
  async verifyJoinCode(
    code: string,
  ): Promise<{ valid: boolean; state: QuizGameState | null }> {
    const data = JSON.parse(
      await this.redisService.get(this.getJoinCodeKey(code)),
    );

    if (!data) {
      return { valid: false, state: null };
    }

    return {
      valid: true,
      state: data,
    };
  }

  // Participant management
  private getParticipantsKey(code: string): string {
    return `quiz:${code}:participants`;
  }

  async getParticipants(code: string): Promise<Array<{userId: string, username: string}>> {
    const key = this.getParticipantsKey(code);
    const participants = await this.redisService.hgetall(key);
    return Object.entries(participants).map(([userId, username]) => ({
      userId,
      username
    }));
  }

  // Game state management
  private getUserQuizKey(userId: string, code: string): string {
    return `user:${userId}:quiz:${code}`;
  }

  async getQuizState(code: string): Promise<QuizGameState | null> {
    return JSON.parse(await this.redisService.get(this.getJoinCodeKey(code)));
  }

  async setQuizState(code: string, state: QuizGameState): Promise<void> {
    await this.redisService.set(
      this.getJoinCodeKey(code),
      JSON.stringify(state),
      86400000,
    ); // 24 hours TTL
  }

  async initializeQuizState(
    quizId: number,
    code: string,
  ): Promise<QuizGameState> {
    const initialState: QuizGameState = {
      quizId,
      currentQuestionIndex: 0,
      startTime: Date.now(),
      isActive: false,
      currentQuestionStartTime: 0,
      participants: [],
      questions: [],
    };

    await this.setQuizState(code, initialState);
    return initialState;
  }

  async updateQuizState(
    code: string,
    partialState: Partial<QuizGameState>,
  ): Promise<QuizGameState> {
    const currentState = await this.getQuizState(code);
    if (!currentState) {
      throw new NotFoundException(`Quiz state for quiz ${code} not found`);
    }

    const updatedState = { ...currentState, ...partialState };
    await this.setQuizState(code, updatedState);
    return updatedState;
  }

  async getUserState(
    userId: string,
    code: string,
  ): Promise<UserGameState | null> {
    return JSON.parse(
      await this.redisService.get(this.getUserQuizKey(userId, code)),
    );
  }

  async setUserState(
    userId: string,
    code: string,
    state: UserGameState,
  ): Promise<void> {
    await this.redisService.set(
      this.getUserQuizKey(userId, code),
      JSON.stringify(state),
      86400000,
    ); // 24 hours TTL
  }

  async updateUserState(
    userId: string,
    code: string,
    updates: Partial<UserGameState>,
  ): Promise<UserGameState> {
    const currentState = (await this.getUserState(userId, code)) || {
      userId,
      quizId: Number(code),
      currentQuestionIndex: 0,
      score: 0,
      questionsAnswered: 0,
      answers: [],
    };

    const updatedState = { ...currentState, ...updates };
    await this.setUserState(userId, code, updatedState);
    return updatedState;
  }

  async recordUserAnswer(
    userId: string,
    code: string,
    questionId: number,
    selectedOption: number,
    timeTaken: number,
  ): Promise<UserGameState> {
    const userState = (await this.getUserState(userId, code)) || {
      userId,
      quizId: Number(code),
      currentQuestionIndex: 0,
      questionsAnswered: 0,
      code: '',
      score: 0,
      answers: [],
    };

    const currentQuestion = await this.getCurrentQuestion(code);
    if (!currentQuestion) {
      throw new NotFoundException(
        `Current question not found for quiz ${code}`,
      );
    }

    // Prevent duplicate answers for the same question
    const alreadyAnswered = userState.answers.some(
      (answer) => answer.questionId === questionId
    );
    if (alreadyAnswered) {
      throw new BadRequestException('User has already answered this question.');
    }

    // Add the new answer
    userState.answers.push({
      questionId,
      selectedOption,
      isCorrect: currentQuestion.correctOption === selectedOption,
      timeTaken,
    });

    // Update the score
    userState.score +=
      currentQuestion.correctOption === selectedOption
        ? currentQuestion.timeLimit - timeTaken
        : 0;

    // Don't increment currentQuestionIndex automatically - it should be controlled by the quiz flow
    // Update the current question index to the one just answered
    const currentQuizState = await this.getQuizState(code);
    if (currentQuizState) {
      userState.currentQuestionIndex = currentQuizState.currentQuestionIndex;
    }

    await this.setUserState(userId, code, userState);

    // Also update the participant in the quiz state
    const quizState = await this.getQuizState(code);
    if (quizState) {
      const participantIndex = quizState.participants.findIndex(
        (p) => p.userId === userId,
      );

      if (participantIndex >= 0) {
        quizState.participants[participantIndex].score = userState.score;
        quizState.participants[participantIndex].questionsAnswered =
          userState.answers.length;
        quizState.participants[participantIndex].selectedOption = selectedOption;
        quizState.participants[participantIndex].lastActive = Date.now();
        quizState.participants[participantIndex].answerQuestionIndex = questionId;
      } else {
        quizState.participants.push({
          userId,
          score: userState.score,
          questionsAnswered: userState.answers.length,
          answerQuestionIndex: questionId,
          lastActive: Date.now(),
          selectedOption: selectedOption,
        });
      }

      await this.setQuizState(code, quizState);
    }

    return userState;
  }

  async addParticipant(
    code: string,
    userId: string,
    username: string,
  ): Promise<void> {
    const quizState = await this.getQuizState(code);
    
    const key = this.getParticipantsKey(code);
    await this.redisService.hset(key, userId, username);

    if (!quizState) {
      throw new NotFoundException(`Quiz state for code ${code} not found`);
    }

    // Only add if not already in participants array
    if (
      !quizState.participants.some(
        (p) => p.userId == userId && p.username == username,
      )
    ) {
      quizState.participants.push({
        userId,
        username,
        score: 0,
        questionsAnswered: 0,
        lastActive: Date.now(),
        answerQuestionIndex: null,
        selectedOption: null
      });

      await this.setQuizState(code, quizState);
    }
  }

  async removeParticipant(code: string, userId: string): Promise<void> {
    const quizState = await this.getQuizState(code);
    
    const key = this.getParticipantsKey(code);
    await this.redisService.hdel(key, userId);

    if (!quizState) {
      return; // No error if quiz doesn't exist
    }

    // Filter out the participant
    quizState.participants = quizState.participants.filter(
      (p) => p.userId !== userId,
    );

    await this.setQuizState(code, quizState);
  }

  async joinQuiz(
    code: string,
    userId: string,
    username: string,
  ): Promise<{ success: boolean; message: string }> {
    const quizState = await this.getQuizState(code);
    if (!quizState) {
      return { success: false, message: 'Quiz not found' };
    }

    // Add user to participants hash
    await this.addParticipant(code, userId, username);

    // Initialize user's quiz state
    await this.redisService.set(
      this.getUserQuizKey(userId, code),
      JSON.stringify({
        userId,
        quizId: quizState.quizId,
        currentQuestionIndex: 0,
        questionsAnswered: 0,
        code,
        score: 0,
        answers: [],
      }),
    );

    return {
      success: true,
      message: 'User joined quiz',
    };
  }

  async getLeaderboard(code: string, limit = 10): Promise<any[]> {
    const quizState = await this.getQuizState(code);

    if (!quizState) {
      return [];
    }

    // Sort participants by score (descending) and return top ones
    return [...quizState.participants]
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async getCurrentQuestion(code: string): Promise<QuizQuestion | null> {
    const quizState = await this.getQuizState(code);
    if (!quizState) {
      return null;
    }

    return quizState.questions[quizState.currentQuestionIndex];
  }

  async setActiveQuestion(code: string, questionIndex: number): Promise<void> {
    await this.updateQuizState(code, {
      currentQuestionIndex: questionIndex,
      currentQuestionStartTime: Date.now(),
    });
  }

  async endQuiz(code: string): Promise<void> {
    await this.updateQuizState(code, {
      isActive: false,
      endTime: Date.now(),
    });
  }

  async clearQuizState(code: string): Promise<void> {
    await this.redisService.del(this.getJoinCodeKey(code));
  }

  async clearUserState(userId: string, code: string): Promise<void> {
    const key = this.getUserQuizKey(userId, code);
    await this.redisService.del(key);
  }

  /**
   * Mark a user as disconnected in Redis with a TTL
   * @param code The quiz code
   * @param userId The user ID
   * @param ttlSeconds Time to live in seconds (default: 10 seconds)
   */
  async markUserDisconnected(code: string, userId: string, ttlSeconds = 10): Promise<void> {
    const key = `quiz:${code}:disconnected:${userId}`;
    await this.redisService.set(key, '1', ttlSeconds);
  }

  /**
   * Check if a user is marked as disconnected
   * @param code The quiz code
   * @param userId The user ID
   * @returns True if the user is marked as disconnected
   */
  async isUserDisconnected(code: string, userId: string): Promise<boolean> {
    const key = `quiz:${code}:disconnected:${userId}`;
    const result = await this.redisService.get(key);
    return result === '1';
  }
}

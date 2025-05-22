import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { QuizUserService } from '../services/quiz-user.service';
import { QuizRedisService } from '../services/quiz-redis.service';
import { SubmitAnswerDto } from '../dto/submit-answer.dto';
import { UseGuards, Inject } from '@nestjs/common';
import { Logger } from '@nestjs/common';

interface AuthenticatedSocket extends Socket {
  user?: {
    userId: string;
    username: string;
    code: string;
    isHost: boolean;
  };
}

@WebSocketGateway({
  namespace: 'quiz',
  cors: {
    origin: '*',
  },
})
export class QuizGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(QuizGateway.name);

  constructor(
    private readonly quizUserService: QuizUserService,
    private readonly quizRedisService: QuizRedisService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      client.user = {
        userId: client.handshake.auth.userId,
        username: client.handshake.auth.username,
        code: client.handshake.auth.code,
        isHost: client.handshake.auth.isHost,
      };

      this.logger.log(`Client connected: ${client.id}`);
    } catch (error) {
      this.logger.error(
        `Error handling connection: ${error.message}`,
        error.stack,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.user) {
      const { code, userId, username } = client.user;
      this.quizRedisService.removeParticipant(code, userId);

      if (client.user.isHost) {
        this.server.to(client.user.code).emit('hostDisconnected');
        this.quizRedisService.clearQuizState(client.user.code);
        this.logger.log(`Host disconnected: ${client.id}`);
      }

      // Notify room that participant left
      this.server.to(code).emit('participantLeft', {
        userId,
        username,
      });

      this.logger.log(`Client disconnected: ${client.id}`);
    }
  }

  @SubscribeMessage('joinQuizByCode')
  async handleJoinQuiz(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { code: string; userId: string; username: string },
  ) {
    try {
      console.log('Client connected: ', data);
      const { code, userId, username } = data;
      const result = await this.quizUserService.joinQuiz(
        code,
        userId,
        username,
      );

      if (!result?.success) {
        return { event: 'error', data: result };
      }

      client.join(code);

      const quizState = await this.quizRedisService.getQuizState(code);
      const activeUsers = quizState?.participants;
      console.log('Active users: ', activeUsers);
      this.server.to(code).emit('participantJoined', {
        userId: userId,
        username: username,
        activeUsers,
      });

      return {
        event: 'joinedQuiz',
        data: {
          ...result,
          activeUsers,
          currentState: quizState,
        },
      };
    } catch (error) {
      this.logger.error(`Error joining quiz: ${error.message}`, error.stack);
      return { event: 'error', data: { message: error.message } };
    }
  }

  @SubscribeMessage('joinedGame')
  async handleJoinedGame(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { code: string },
  ) {
    this.quizRedisService.addParticipant(data.code, client.user.userId, client.user.username);
    const quizState = await this.quizRedisService.getQuizState(data.code);
    if (!quizState) {
      return { event: 'error', data: { message: 'Quiz not found' } };
    }
    

    const firstQuestion = quizState.questions[0];
    const timeLimit = firstQuestion.timeLimit || 30;
    const totalQuestions = quizState.questions.length;

    this.server.to(data.code).emit('questionStarted', {
      code: data.code,
      questionIndex: 0,
      question: quizState.questions[0],
      timeLimit: quizState.questions[0].timeLimit || 30,
      totalQuestions,
    });
  }

  @SubscribeMessage('submitAnswer')
  async handleSubmitAnswer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: SubmitAnswerDto,
  ) {
    try {
      if (!client.user) {
        throw new WsException('Unauthorized');
      }

      // Submit answer using the service
      const result = await this.quizUserService.submitAnswer(
        data,
        client.user.userId,
      );

      if (result.success) {
        // Record answer in Redis
        await this.quizRedisService.recordUserAnswer(
          client.user.userId,
          client.user.code,
          data.questionId,
          data.selectedOption,
          result.result.isCorrect,
          data.timeTaken || 0,
          result.result.score,
        );

        // Send result directly to the user who submitted the answer
        client.emit('answerResult', {
          questionId: data.questionId,
          selectedOption: data.selectedOption,
          isCorrect: result.result.isCorrect,
          score: result.result.score,
        });

        // Notify the host about the answer
        this.server.to(client.user.code).emit('answerSubmitted', {
          userId: client.user.userId,
          username: client.user.username,
          questionId: data.questionId,
          selectedOption: data.selectedOption,
          isCorrect: result.result.isCorrect,
        });

        // Get updated leaderboard from Redis
        const leaderboard = await this.quizRedisService.getLeaderboard(
          client.user.code,
        );

        // Update leaderboard for all users in the room
        this.server.to(client.user.code).emit('leaderboardUpdated', {
          success: true,
          leaderboard,
        });

        // Check if this was the last question
        const quizState = await this.quizRedisService.getQuizState(
          client.user.code,
        );
        const isLastQuestion =
          data.questionIndex === quizState.questions.length - 1;

        if (isLastQuestion) {
          // Signal quiz completion to all clients
          this.server.to(client.user.code).emit('quizEnded', {
            code: client.user.code,
            leaderboard,
          });

          // Mark quiz as inactive in Redis
          await this.quizRedisService.endQuiz(client.user.code);
        }
      }

      return { event: 'answerResult', data: result };
    } catch (error) {
      this.logger.error(
        `Error submitting answer: ${error.message}`,
        error.stack,
      );
      return { event: 'error', data: { message: error.message } };
    }
  }

  @SubscribeMessage('getLeaderboard')
  async handleGetLeaderboard(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { code: string; limit?: number },
  ) {
    try {
      // Get leaderboard from Redis for real-time data
      const leaderboard = await this.quizRedisService.getLeaderboard(
        data.code,
        data.limit || 10,
      );
      return {
        event: 'leaderboard',
        data: {
          success: true,
          leaderboard,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error getting leaderboard: ${error.message}`,
        error.stack,
      );
      return { event: 'error', data: { message: error.message } };
    }
  }

  @SubscribeMessage('getProgress')
  async handleGetProgress(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { code: string },
  ) {
    try {
      if (!client.user) {
        throw new WsException('Unauthorized');
      }

      // Get user's state from Redis for real-time progress
      const userState = await this.quizRedisService.getUserState(
        client.user.userId,
        data.code,
      );

      if (userState) {
        return {
          event: 'progress',
          data: {
            success: true,
            currentQuestionIndex: userState.currentQuestionIndex,
            score: userState.score,
            answersCount: userState.answers.length,
          },
        };
      }

      // Fall back to database if Redis state is not available
      const progress = await this.quizUserService.getQuizProgress(
        data.code,
        client.user.userId,
      );

      return { event: 'progress', data: progress };
    } catch (error) {
      this.logger.error(
        `Error getting progress: ${error.message}`,
        error.stack,
      );
      return { event: 'error', data: { message: error.message } };
    }
  }
}

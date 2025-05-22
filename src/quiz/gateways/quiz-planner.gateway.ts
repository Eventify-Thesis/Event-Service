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
export class QuizPlannerGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(QuizPlannerGateway.name);

  constructor(private readonly quizRedisService: QuizRedisService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Authentication would be handled here in a real app
      // For now, we just use the client ID as user ID
      client.user = {
        userId: client.id,
        username: `User-${client.id.substring(0, 5)}`,
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
    console.log('Client disconnected: ', client.user);
    if (client.user) {
      if (client.user.isHost) {
        this.server.to(client.user.code).emit('hostDisconnected');
        this.quizRedisService.clearQuizState(client.user.code);
        this.logger.log(`Host disconnected: ${client.id}`);
      } else {
        this.logger.log(`Client disconnected: ${client.id}`);
      }
    }
  }

  @SubscribeMessage('startQuiz')
  async handleStartQuiz(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { quizId: number; code: string },
  ) {
    try {
      // Initialize the quiz state in Redis
      await this.quizRedisService.updateQuizState(data.code, {
        isActive: true,
        startTime: Date.now(),
        currentQuestionIndex: 0,
      });

      // Notify all clients in the room that the quiz has started
      this.server.to(data.code).emit('quizStarted', {
        quizId: data.quizId,
        startTime: Date.now(),
      });

      return { event: 'quizStarted', data: { success: true } };
    } catch (error) {
      this.logger.error(`Error starting quiz: ${error.message}`, error.stack);
      return { event: 'error', data: { message: error.message } };
    }
  }

  @SubscribeMessage('endQuiz')
  async handleEndQuiz(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { code: string },
  ) {
    try {
      if (!client.user || !client.user.isHost) {
        throw new WsException('Unauthorized: Only hosts can end the quiz');
      }

      // End the quiz in Redis
      await this.quizRedisService.endQuiz(data.code);

      // Get final leaderboard
      const leaderboard = await this.quizRedisService.getLeaderboard(data.code);

      // Notify all clients
      this.server.to(data.code).emit('quizEnded', {
        code: data.code,
        endTime: Date.now(),
        leaderboard,
      });

      return { event: 'quizEnded', data: { success: true } };
    } catch (error) {
      this.logger.error(`Error ending quiz: ${error.message}`, error.stack);
      return { event: 'error', data: { message: error.message } };
    }
  }

  @SubscribeMessage('nextQuestion')
  async handleNextQuestion(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { code: string },
  ) {
    try {
      if (!client.user || !client.user.isHost) {
        throw new WsException('Unauthorized: Only hosts can advance questions');
      }

      // Get current quiz state
      const quizState = await this.quizRedisService.getQuizState(data.code);
      if (!quizState) {
        throw new WsException('Quiz not found');
      }

      // Calculate next question index
      const nextQuestionIndex = quizState.currentQuestionIndex + 1;

      // Check if we're at the end of the quiz
      if (nextQuestionIndex >= quizState.questions.length) {
        // End the quiz
        await this.quizRedisService.endQuiz(data.code);

        // Get final leaderboard
        const leaderboard = await this.quizRedisService.getLeaderboard(
          data.code,
        );

        // Notify all clients
        this.server.to(data.code).emit('quizEnded', {
          code: data.code,
          endTime: Date.now(),
          leaderboard,
        });

        return { event: 'quizEnded', data: { success: true } };
      }

      // Update the current question index
      await this.quizRedisService.setActiveQuestion(
        data.code,
        nextQuestionIndex,
      );

      // Get the next question details
      const nextQuestion = quizState.questions[nextQuestionIndex];
      const timeLimit = nextQuestion.timeLimit || 30;

      // Notify all clients
      this.server.to(data.code).emit('questionStarted', {
        questionIndex: nextQuestionIndex,
        question: nextQuestion,
        timeLimit,
        totalQuestions: quizState.questions.length,
      });

      return {
        event: 'nextQuestion',
        data: {
          success: true,
          currentQuestionIndex: nextQuestionIndex,
          timeLimit,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error advancing question: ${error.message}`,
        error.stack,
      );
      return { event: 'error', data: { message: error.message } };
    }
  }
}

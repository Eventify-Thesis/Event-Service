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
      if (!client.handshake.auth.isHost) {
        return;
      }

      // Set up user data from auth information
      client.user = {
        userId: client.handshake.auth.userId || client.id,
        username:
          client.handshake.auth.username || `Host-${client.id.substring(0, 5)}`,
        code: client.handshake.auth.code,
        isHost: true, // Force isHost to true for this gateway
      };

      const quizState = await this.quizRedisService.getQuizState(
        client.user.code,
      );

      if (quizState.isActive) {
        client.emit('updateGameState', {
          code: client.user.code,
          questionIndex: quizState.currentQuestionIndex,
          question: quizState.questions[quizState.currentQuestionIndex],
          timeLimit:
            quizState.questions[quizState.currentQuestionIndex].timeLimit,
          participants: quizState.participants,
          currentQuestionStartTime: quizState.currentQuestionStartTime,
        });
      }

      if (client.user.code && quizState) {
        client.join(client.user.code);
      }

      this.logger.log(
        `Host connected: ${client.id} for quiz code: ${client.user.code}`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling host connection: ${error.message}`,
        error.stack,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    try {
      if (client.user && client.user.code) {
        // Always treat disconnections in this gateway as host disconnections
        this.server.to(client.user.code).emit('hostDisconnected', {
          message: 'The quiz host has disconnected',
          timestamp: Date.now(),
        });

        // Optionally clear quiz state - commented out to allow reconnection
        // this.quizRedisService.clearQuizState(client.user.code);

        this.logger.log(
          `Host disconnected: ${client.id} from quiz code: ${client.user.code}`,
        );
      } else {
        this.logger.log(`Unknown client disconnected: ${client.id}`);
      }
    } catch (error) {
      this.logger.error(
        `Error handling host disconnection: ${error.message}`,
        error.stack,
      );
    }
  }

  @SubscribeMessage('hostJoinedQuiz')
  async handleHostJoinedQuiz(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { code: string },
  ) {
    try {
      // Verify this is a host
      if (!client.user || !client.user.isHost) {
        throw new WsException('Unauthorized: Only hosts can initialize a quiz');
      }

      // Make sure we have a code
      if (!data.code) {
        throw new WsException('Quiz code is required');
      }

      // Ensure the client's code matches the event code
      if (client.user.code !== data.code) {
        client.user.code = data.code;
        client.join(data.code);
      }

      // Initialize or retrieve the quiz state in Redis
      let quizState = await this.quizRedisService.getQuizState(data.code);

      if (!quizState) {
        // Initialize new quiz state if none exists
        await this.quizRedisService.updateQuizState(data.code, {
          isActive: true,
          startTime: Date.now(),
          currentQuestionIndex: 0,
          participants: [],
        });

        quizState = await this.quizRedisService.getQuizState(data.code);
      }

      // Notify all clients in the room that the host has joined
      this.server.to(data.code).emit('hostJoinedQuiz', {
        code: data.code,
        quizState,
        timestamp: Date.now(),
      });

      this.logger.log(`Host initialized quiz: ${data.code}`);
      return { event: 'hostJoinedQuiz', data: { success: true, quizState } };
    } catch (error) {
      this.logger.error(
        `Error in hostJoinedQuiz: ${error.message}`,
        error.stack,
      );
      return { event: 'error', data: { message: error.message } };
    }
  }

  @SubscribeMessage('startQuiz')
  async handleStartQuiz(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { code: string },
  ) {
    try {
      this.logger.log(`Host started quiz: ${data.code}`);
      // Initialize the quiz state in Redis
      await this.quizRedisService.updateQuizState(data.code, {
        isActive: true,
        startTime: Date.now(),
        currentQuestionIndex: 0,
        currentQuestionStartTime: Date.now(),
      });

      this.logger.log(`Quiz started: ${data.code}`);

      this.server.to(data.code).emit('quizStarted', {
        code: data.code,
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

  @SubscribeMessage('questionTimeUp')
  async handleQuestionTimeUp(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { code: string; questionIndex: number },
  ) {
    try {
      const quizState = await this.quizRedisService.getQuizState(data.code);
      if (!quizState) {
        throw new WsException('Quiz not found');
      }

      const questionIndex = data.questionIndex;
      const question = quizState.questions[questionIndex];

      this.server.to(data.code).emit('questionTimeUp', {
        code: data.code,
        questionIndex,
        question,
      });
    } catch (error) {
      this.logger.error(
        `Error handling question time up: ${error.message}`,
        error.stack,
      );
    }
  }

  @SubscribeMessage('endQuestion')
  async handleEndQuestion(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { code: string },
  ) {
    try {
      const quizState = await this.quizRedisService.getQuizState(data.code);
      if (!quizState) {
        throw new WsException('Quiz not found');
      }

      const leaderboard = await this.quizRedisService.getLeaderboard(data.code);

      this.server.to(data.code).emit('questionEnded', {
        code: data.code,
        leaderboard,
        participants: quizState.participants,
      });

      this.server.to(data.code).emit('updateGameState', {
        code: data.code,
        questionIndex: quizState.currentQuestionIndex,
        question: quizState.questions[quizState.currentQuestionIndex],
        timeLimit:
          quizState.questions[quizState.currentQuestionIndex].timeLimit,
        currentQuestionStartTime: quizState.currentQuestionStartTime,
        participants: quizState.participants,
      });
    } catch (error) {
      this.logger.error(`Error ending question: ${error.message}`, error.stack);
    }
  }

  @SubscribeMessage('nextQuestion')
  async handleNextQuestion(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { code: string },
  ) {
    try {
      // Validate that this is a host
      if (!client.user || !client.user.isHost) {
        throw new WsException('Unauthorized: Only hosts can advance questions');
      }

      // Ensure we have a code
      if (!data.code) {
        throw new WsException('Quiz code is required');
      }

      // Get current quiz state
      const quizState = await this.quizRedisService.getQuizState(data.code);
      if (!quizState) {
        throw new WsException('Quiz not found');
      }

      // Calculate next question index
      const nextQuestionIndex = quizState.currentQuestionIndex + 1;

      // Check if we're at the end of the quiz
      if (
        !quizState.questions ||
        nextQuestionIndex >= quizState.questions.length
      ) {
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
          message: 'Quiz has ended',
        });

        this.logger.log(`Quiz ended: ${data.code}`);
        return { event: 'quizEnded', data: { success: true, leaderboard } };
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
      this.server.to(data.code).emit('nextQuestion', {
        code: data.code,
        questionIndex: nextQuestionIndex,
        question: nextQuestion,
        timeLimit,
        totalQuestions: quizState.questions.length,
        currentQuestionStartTime: quizState.currentQuestionStartTime,
        timestamp: Date.now(),
      });

      this.server.to(data.code).emit('updateGameState', {
        code: data.code,
        questionIndex: nextQuestionIndex,
        question: nextQuestion,
        timeLimit,
        participants: quizState.participants,
        totalQuestions: quizState.questions.length,
        currentQuestionStartTime: quizState.currentQuestionStartTime,
      });

      this.logger.log(
        `Advanced to question ${nextQuestionIndex + 1} for quiz: ${data.code}`,
      );
      return {
        event: 'nextQuestionStarted',
        data: {
          success: true,
          currentQuestionIndex: nextQuestionIndex,
          timeLimit,
          totalQuestions: quizState.questions.length,
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

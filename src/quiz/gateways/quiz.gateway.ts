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
      // Basic validation of connection data
      const { userId, username, code, isHost } = client.handshake.auth;
      if (isHost) {
        return;
      }
      if (!code) {
        this.logger.warn(
          `Client attempted to connect without a quiz code: ${client.id}`,
        );
        client.disconnect();
        return;
      }

      client.join(code);

      // Store user info in the socket
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
    try {
      if (client.user) {
        const { code, userId, username, isHost } = client.user;

        // Update Redis to remove the participant
        if (code && userId) {
          this.quizRedisService.removeParticipant(code, userId);
        }

        // If by chance a host is using this gateway, handle it
        if (isHost) {
          this.server.to(code).emit('hostDisconnected', {
            message: 'The quiz host has disconnected',
            timestamp: Date.now(),
          });
          // Don't clear the quiz state to allow reconnection
          // this.quizRedisService.clearQuizState(code);
          this.logger.log(
            `Host disconnected from player gateway: ${client.id}`,
          );
        }

        // Notify room that participant left
        this.server.to(code).emit('participantLeft', {
          userId,
          username,
          timestamp: Date.now(),
        });

        this.logger.log(
          `Client disconnected: ${client.id} (${username}) from quiz: ${code}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error handling disconnection: ${error.message}`,
        error.stack,
      );
    }
  }

  @SubscribeMessage('joinQuizByCode')
  async handleJoinQuiz(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { code: string; userId: string; username: string },
  ) {
    try {
      // Make sure we have all required data
      if (!data.code) {
        throw new WsException('Quiz code is required');
      }

      // Update user data on the socket if needed
      if (!client.user) {
        client.user = {
          userId: data.userId,
          username: data.username,
          code: data.code,
          isHost: false,
        };
      } else if (client.user.code != data.code) {
        // If user is trying to join a different quiz, update the code
        // and make sure they leave previous room and join new one
        if (client.user.code) {
          client.leave(client.user.code);
        }
        client.user.code = data.code;
        client.join(data.code);
      }

      const { code, userId, username } = data;

      // Use the service to join the quiz (handles database operations)
      const result = await this.quizUserService.joinQuiz(
        code,
        userId,
        username,
      );

      if (!result?.success) {
        return { event: 'error', data: result };
      }

      // Make sure client is in the correct room
      client.join(code);

      // Get the current quiz state
      const quizState = await this.quizRedisService.getQuizState(code);
      const activeUsers = quizState?.participants || [];

      this.logger.log(
        `User joined quiz: ${username} (${userId}) joined quiz: ${code}`,
      );

      this.server.to(code).emit('participantJoined', {
        userId,
        username,
        joinTime: Date.now(),
      });

      // Return success with quiz state to the client
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

  @SubscribeMessage('userJoinedQuiz')
  async handleUserJoinedQuiz(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { code: string },
  ) {
    try {
      // Validate user and data
      if (!client.user) {
        throw new WsException('Unauthorized: User data not found');
      }

      if (!data.code) {
        throw new WsException('Quiz code is required');
      }

      // Add participant to Redis
      this.logger.log(
        `User active in quiz: ${client.user.username} (${client.user.userId}) in quiz: ${data.code}`,
      );

      await this.quizRedisService.addParticipant(
        data.code,
        client.user.userId,
        client.user.username,
      );

      // Get the current quiz state
      const quizState = await this.quizRedisService.getQuizState(data.code);
      if (!quizState) {
        throw new WsException('Quiz not found or not active');
      }

      // Make sure we have questions
      if (!quizState.questions || !quizState.questions.length) {
        return {
          event: 'waiting',
          data: {
            message: 'Waiting for quiz to start',
            code: data.code,
          },
        };
      }

      const totalQuestions = quizState.questions.length;
      const currentQuestionIndex = quizState.currentQuestionIndex || 0;
      const currentQuestion = quizState.questions[currentQuestionIndex];
      const userState = await this.quizRedisService.getUserState(
        client.user.userId,
        data.code,
      );

      // Notify everyone about the current question
      client.emit('updateGameStateUser', {
        code: data.code,
        questionIndex: currentQuestionIndex,
        question: currentQuestion,
        timeLimit: currentQuestion.timeLimit || 30,
        currentQuestionStartTime: quizState.currentQuestionStartTime,
        totalQuestions,
        userState,
      });

      // Notify everyone that a new user is active
      this.server.to(data.code).emit('userJoinedQuiz', {
        code: data.code,
        userId: client.user.userId,
        username: client.user.username,
        timestamp: Date.now(),
      });

      // Return the current question to the user who just joined
      return {
        event: 'questionStarted',
        data: {
          code: data.code,
          questionIndex: currentQuestionIndex,
          question: currentQuestion,
          timeLimit: currentQuestion.timeLimit || 30,
          totalQuestions,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error handling userJoinedQuiz: ${error.message}`,
        error.stack,
      );
      return { event: 'error', data: { message: error.message } };
    }
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

      await this.quizUserService.submitAnswer(data, client.user.userId);

      // Notify the host about the answer
      this.server.to(client.user.code).emit('answerSubmitted', {
        userId: client.user.userId,
        username: client.user.username,
        questionIndex: data.questionIndex,
        selectedOption: data.selectedOption,
      });

      // Get updated leaderboard from Redis
      const leaderboard = await this.quizRedisService.getLeaderboard(
        client.user.code,
      );

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

      return { event: 'answerResult', data: { success: true } };
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

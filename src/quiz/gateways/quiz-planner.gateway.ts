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
          currentQuestionIndex: quizState.currentQuestionIndex,
          question: quizState.questions[quizState.currentQuestionIndex],
          timeLimit:
            quizState.questions[quizState.currentQuestionIndex].timeLimit,
          participants: quizState.participants,
          isTimerRunning: quizState.isActive,
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
  @SubscribeMessage('requestQuizState')
  async handleRequestQuizState(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { code: string },
  ) {
    try {
      if (!data.code) {
        throw new WsException('Quiz code is required');
      }

      const quizState = await this.quizRedisService.getQuizState(data.code);
      if (!quizState) {
        throw new WsException('Quiz not found');
      }

      // Send the current quiz state to the requesting client
      client.emit('quizState', {
        code: data.code,
        currentQuestionIndex: quizState.currentQuestionIndex,
        question: quizState.questions[quizState.currentQuestionIndex],
        participants: quizState.participants,
        timeLimit: quizState.questions[quizState.currentQuestionIndex]?.timeLimit || 30,
        isTimerRunning: quizState.isActive,
        showResults: false, // You might want to track this in your quiz state
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Error handling quiz state request: ${error.message}`, error.stack);
      return { success: false, error: error.message };
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

      // Get the current quiz state
      const quizState = await this.quizRedisService.getQuizState(data.code);

      // Initialize the quiz state in Redis
      await this.quizRedisService.updateQuizState(data.code, {
        ...quizState,
        isActive: true,
        startTime: Date.now(),
        currentQuestionIndex: 0,
        currentQuestionStartTime: Date.now(),
      });

      this.logger.log(`Quiz started: ${data.code}`);

      // Get the updated quiz state
      const updatedState = await this.quizRedisService.getQuizState(data.code);

      // Emit the first question data along with the quiz started event
      this.server.to(data.code).emit('quizStarted', {
        code: data.code,
        startTime: Date.now(),
        currentQuestionIndex: updatedState.currentQuestionIndex,
        question: updatedState.questions[updatedState.currentQuestionIndex],
        timeLimit: updatedState.questions[updatedState.currentQuestionIndex]?.timeLimit || 30,
        currentQuestionStartTime: Date.now(),
        participants: updatedState.participants || [],
      });

      return { event: 'quizStarted', data: { success: true } };
    } catch (error) {
      this.logger.error(`Error starting quiz: ${error.message}`, error.stack);
      return { event: 'error', data: { message: error.message } };
    }
  }

  @SubscribeMessage('pauseTimer')
  async handlePauseTimer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { code: string },
  ) {
    try {
      this.logger.log(`Host paused timer for quiz: ${data.code}`);

      // Emit the timer paused event to all clients
      this.server.to(data.code).emit('timerPaused', {
        code: data.code,
        timestamp: Date.now(),
      });

      return { event: 'timerPaused', data: { success: true } };
    } catch (error) {
      this.logger.error(`Error pausing timer: ${error.message}`, error.stack);
      return { event: 'error', data: { message: error.message } };
    }
  }

  @SubscribeMessage('resumeTimer')
  async handleResumeTimer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { code: string },
  ) {
    try {
      this.logger.log(`Host resumed timer for quiz: ${data.code}`);

      // Emit the timer resumed event to all clients
      this.server.to(data.code).emit('timerResumed', {
        code: data.code,
        timestamp: Date.now(),
      });

      return { event: 'timerResumed', data: { success: true } };
    } catch (error) {
      this.logger.error(`Error resuming timer: ${error.message}`, error.stack);
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

      return { event: 'quizEndedForHost', data: { success: true, leaderboard } };
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
      const leaderboard = await this.quizRedisService.getLeaderboard(data.code);
      if (!quizState) {
        throw new WsException('Quiz not found');
      }

      const questionIndex = data.questionIndex;
      const question = quizState.questions[questionIndex];

      this.server.to(data.code).emit('questionTimeUp', {
        code: data.code,
        questionIndex,
        question,
        leaderboard,
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
        currentQuestionIndex: quizState.currentQuestionIndex,
        question: quizState.questions[quizState.currentQuestionIndex],
        timeLimit:
          quizState.questions[quizState.currentQuestionIndex].timeLimit,
        currentQuestionStartTime: quizState.currentQuestionStartTime,
        participants: quizState.participants,
        leaderboard,
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

      // Get final leaderboard
      const leaderboard = await this.quizRedisService.getLeaderboard(
        data.code,
      );

      // Check if we're at the end of the quiz
      if (
        !quizState.questions ||
        nextQuestionIndex >= quizState.questions.length
      ) {
        // End the quiz
        await this.quizRedisService.endQuiz(data.code);

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

      // Get current time to start new question
      const now = Date.now();

      // Update quiz state with new question index and start time
      await this.quizRedisService.updateQuizState(data.code, {
        ...quizState,
        currentQuestionIndex: nextQuestionIndex,
        currentQuestionStartTime: now,
      });

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
        currentQuestionIndex: nextQuestionIndex,
        question: nextQuestion,
        timeLimit,
        totalQuestions: quizState.questions.length,
        currentQuestionStartTime: now,
        timestamp: now,
        leaderboard,
      });

      this.server.to(data.code).emit('updateGameState', {
        code: data.code,
        currentQuestionIndex: nextQuestionIndex,
        question: nextQuestion,
        timeLimit,
        participants: quizState.participants,
        totalQuestions: quizState.questions.length,
        currentQuestionStartTime: now,
        leaderboard,
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
          currentQuestionStartTime: now,
          leaderboard,
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

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { MessageService } from './message.service';
import { PlannerMessageController } from './controllers/planner/message.controller';
import { ClerkClientProvider } from 'src/providers/clerk-client.provider';
import { EmailModule } from 'src/email/email.module';
import { MessageRepository } from './repositories/message.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), EmailModule],
  controllers: [PlannerMessageController],
  providers: [
    MessageService, 
    ClerkClientProvider,
    MessageRepository,
  ],
  exports: [MessageRepository],
})
export class MessageModule { }

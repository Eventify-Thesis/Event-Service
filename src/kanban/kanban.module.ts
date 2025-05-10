import { Module } from '@nestjs/common';
import { KanbanService } from './kanban.service';
import { KanbanController } from './kanban.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KanbanBoard } from './entities/kanban-board.entity';
import { KanbanColumn } from './entities/kanban-column.entity';
import { KanbanTask } from './entities/kanban-task.entity';
import { TaskAssignment } from './entities/task-assignment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KanbanBoard, KanbanColumn, KanbanTask, TaskAssignment])],
  controllers: [KanbanController],
  providers: [KanbanService],
})
export class KanbanModule { }

import { Module } from '@nestjs/common';
import { KanbanService } from './kanban.service';
import { KanbanController } from './kanban.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KanbanBoard } from './entities/kanban-board.entity';
import { KanbanColumn } from './entities/kanban-column.entity';
import { KanbanTask } from './entities/kanban-task.entity';
import { TaskAssignment } from './entities/task-assignment.entity';
import { KanbanBoardRepository } from './repositories/kanban-board.repository';
import { KanbanTaskRepository } from './repositories/kanban-task.repository';
import { KanbanColumnRepository } from './repositories/kanban-column.repository';
import { TaskAssignmentRepository } from './repositories/task-assignment.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      KanbanBoard, 
      KanbanColumn, 
      KanbanTask, 
      TaskAssignment
    ])
  ],
  controllers: [KanbanController],
  providers: [
    KanbanService,
    KanbanBoardRepository,
    KanbanTaskRepository,
    KanbanColumnRepository,
    TaskAssignmentRepository
  ],
  exports: [
    KanbanBoardRepository,
    KanbanTaskRepository,
    KanbanColumnRepository,
    TaskAssignmentRepository
  ],
})
export class KanbanModule { }

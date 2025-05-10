import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { CreateKanbanTaskDto } from './dto/create-kanban-task.dto';
import { UpdateKanbanTaskDto } from './dto/update-kanban-task.dto';
import { UpdateTaskPositionDto } from './dto/update-task-position.dto';
import { UpdateTaskAssignmentsDto } from './dto/update-task-assignments.dto';
import { CreateKanbanColumnDto } from './dto/create-kanban-column.dto';
import { KanbanBoard } from './entities/kanban-board.entity';
import { KanbanColumn } from './entities/kanban-column.entity';
import { KanbanTask } from './entities/kanban-task.entity';
import { TaskAssignment } from './entities/task-assignment.entity';
import { UpdateKanbanColumnDto } from './dto/update-kanban-column.dto';

@Injectable()
export class KanbanService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(KanbanBoard)
    private kanbanBoardRepository: Repository<KanbanBoard>,
    @InjectRepository(KanbanColumn)
    private kanbanColumnRepository: Repository<KanbanColumn>,
    @InjectRepository(KanbanTask)
    private kanbanTaskRepository: Repository<KanbanTask>,
    @InjectRepository(TaskAssignment)
    private taskAssignmentRepository: Repository<TaskAssignment>,
  ) { }

  // Create a new Kanban board with default columns
  async createBoard(eventId: number) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if a board already exists for this event
      const existingBoard = await this.kanbanBoardRepository.findOne({
        where: { eventId },
      });

      if (existingBoard) {
        return { success: false, message: 'A Kanban board already exists for this event', boardId: existingBoard.id };
      }

      // Create new board
      const board = this.kanbanBoardRepository.create({
        eventId,
        name: 'Show Planning',
      });

      const savedBoard = await queryRunner.manager.save(board);

      // Create default columns
      const defaultColumns = [
        { name: 'To Do', position: 0 },
        { name: 'In Progress', position: 1 },
        { name: 'Done', position: 2 },
      ];

      const columns = defaultColumns.map(col =>
        this.kanbanColumnRepository.create({
          boardId: savedBoard.id,
          name: col.name,
          position: col.position,
        })
      );

      await queryRunner.manager.save(columns);
      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Kanban board created successfully',
        board: savedBoard,
        columns
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new Error(`Failed to create Kanban board: ${err.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  // Create a new Kanban column
  async createColumn(eventId: number, createColumnDto: CreateKanbanColumnDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get the board for this event
      const board = await this.kanbanBoardRepository.findOne({
        where: { eventId },
      });

      if (!board) {
        return { success: false, message: 'No Kanban board found for this event' };
      }

      // Get the highest position in existing columns to put the new one at the end
      const columns = await this.kanbanColumnRepository.find({
        where: { boardId: board.id },
        order: { position: 'DESC' },
        take: 1,
      });

      const position = columns.length > 0 ? columns[0].position + 1 : 0;

      // Create new column
      const column = this.kanbanColumnRepository.create({
        boardId: board.id,
        name: createColumnDto.name,
        position: createColumnDto.position !== undefined ? createColumnDto.position : position,
      });

      const savedColumn = await queryRunner.manager.save(column);
      await queryRunner.commitTransaction();

      return savedColumn;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new Error(`Failed to create Kanban column: ${err.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  // Get all columns for a specific event
  async getColumns(eventId: number) {
    // Get the kanban board for this event
    const board = await this.kanbanBoardRepository.findOne({
      where: { eventId },
    });

    if (!board) {
      return [];
    }

    // Get all columns for this board, ordered by position
    return this.kanbanColumnRepository.find({
      where: { boardId: board.id },
      order: { position: 'ASC' },
    });
  }

  async updateColumn(id: number, updateColumnDto: UpdateKanbanColumnDto) {
    const column = await this.kanbanColumnRepository.findOne({ where: { id } });
    if (!column) {
      throw new Error('Column not found');
    }
    column.name = updateColumnDto.name;
    column.position = updateColumnDto.position;
    return this.kanbanColumnRepository.save(column);
  }

  async removeColumn(id: number) {
    try {
      await this.kanbanColumnRepository.delete(id);
      return true;
    } catch (error) {
      throw new Error(`Failed to remove Kanban column: ${error.message}`);
    }
  }

  // Get all tasks for a specific event
  async getTasks(eventId: number) {
    // Get the kanban board for this event
    const board = await this.kanbanBoardRepository.findOne({
      where: { eventId },
    });

    if (!board) {
      return [];
    }

    // Get all columns for this board
    const columns = await this.kanbanColumnRepository.find({
      where: { boardId: board.id },
    });

    if (columns.length === 0) {
      return [];
    }

    // Get all tasks for these columns, ordered by position
    const columnIds = columns.map((column) => column.id);
    return this.kanbanTaskRepository.find({
      where: { columnId: In(columnIds) },
      order: { position: 'ASC' },
    });
  }

  // Get all assignments for a specific event
  async getAssignments(eventId: number) {
    // Get the kanban board for this event
    const board = await this.kanbanBoardRepository.findOne({
      where: { eventId },
    });

    if (!board) {
      return [];
    }

    // Get all columns and tasks for this board
    const columns = await this.kanbanColumnRepository.find({
      where: { boardId: board.id },
    });

    if (columns.length === 0) {
      return [];
    }

    const columnIds = columns.map((column) => column.id);
    const tasks = await this.kanbanTaskRepository.find({
      where: { columnId: In(columnIds) },
    });

    if (tasks.length === 0) {
      return [];
    }

    // Get all assignments for these tasks
    const taskIds = tasks.map((task) => task.id);
    return this.taskAssignmentRepository.find({
      where: { taskId: In(taskIds) },
      relations: ['member'],
    });
  }

  // Create a new Kanban task
  async createTask(createKanbanTaskDto: CreateKanbanTaskDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create the task
      const task = this.kanbanTaskRepository.create({
        columnId: createKanbanTaskDto.columnId,
        title: createKanbanTaskDto.title,
        description: createKanbanTaskDto.description,
        position: createKanbanTaskDto.position,
        dueDate: createKanbanTaskDto.dueDate,
        priority: createKanbanTaskDto.priority,
        labels: createKanbanTaskDto.labels || [],
      });

      const savedTask = await queryRunner.manager.save(task);

      // Create assignments if provided
      if (createKanbanTaskDto.assignees && createKanbanTaskDto.assignees.length > 0) {
        const assignments = createKanbanTaskDto.assignees.map((memberId) => {
          return this.taskAssignmentRepository.create({
            taskId: savedTask.id,
            memberId: memberId,
          });
        });

        await queryRunner.manager.save(assignments);
      }

      await queryRunner.commitTransaction();

      return savedTask;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // Update a Kanban task
  async updateTask(id: number, updateKanbanTaskDto: UpdateKanbanTaskDto) {
    console.log(id, updateKanbanTaskDto);
    const task = await this.kanbanTaskRepository.findOne({ where: { id } });
    if (!task) {
      throw new Error('Task not found');
    }

    task.title = updateKanbanTaskDto.title;
    task.description = updateKanbanTaskDto.description;
    task.dueDate = updateKanbanTaskDto.dueDate;
    task.priority = updateKanbanTaskDto.priority;
    task.labels = updateKanbanTaskDto.labels;
    return await this.kanbanTaskRepository.save(task);
  }

  // Update task assignments
  async updateTaskAssignments(id: number, updateTaskAssignmentsDto: UpdateTaskAssignmentsDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Delete existing assignments
      await queryRunner.manager.delete(TaskAssignment, { taskId: id });

      // Create new assignments
      const assignments = updateTaskAssignmentsDto.assignees.map((memberId) => {
        return this.taskAssignmentRepository.create({
          taskId: id,
          memberId: memberId,
        });
      });

      if (assignments.length > 0) {
        await queryRunner.manager.save(assignments);
      }

      await queryRunner.commitTransaction();

      return { success: true, taskId: id, assignees: updateTaskAssignmentsDto.assignees };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // Update task position
  async updateTaskPosition(id: number, updateTaskPositionDto: UpdateTaskPositionDto) {
    await this.kanbanTaskRepository.update(id, updateTaskPositionDto);
    return this.kanbanTaskRepository.findOne({ where: { id } });
  }

  // Delete a Kanban task
  async removeTask(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Delete task assignments first
      await queryRunner.manager.delete(TaskAssignment, { task_id: id });

      // Delete the task
      await queryRunner.manager.delete(KanbanTask, { id });

      await queryRunner.commitTransaction();

      return { success: true, taskId: id };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}

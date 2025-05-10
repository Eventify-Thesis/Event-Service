import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { KanbanService } from './kanban.service';
import { CreateKanbanTaskDto } from './dto/create-kanban-task.dto';
import { UpdateKanbanTaskDto } from './dto/update-kanban-task.dto';
import { UpdateTaskAssignmentsDto } from './dto/update-task-assignments.dto';
import { UpdateTaskPositionDto } from './dto/update-task-position.dto';
import { CreateKanbanColumnDto } from './dto/create-kanban-column.dto';
import { UpdateKanbanColumnDto } from './dto/update-kanban-column.dto';

@Controller('planner/events/:eventId/kanban')
export class KanbanController {
  constructor(private readonly kanbanService: KanbanService) { }

  // Create a new Kanban board with default columns
  @Post('board')
  createBoard(@Param('eventId') eventId: string) {
    return this.kanbanService.createBoard(+eventId);
  }

  // Create a new Kanban column
  @Post('columns')
  createColumn(
    @Param('eventId') eventId: string,
    @Body() createColumnDto: CreateKanbanColumnDto
  ) {
    return this.kanbanService.createColumn(+eventId, createColumnDto);
  }

  // Get all Kanban columns for a specific event/show
  @Get('columns')
  getColumns(@Param('eventId') eventId: number) {
    return this.kanbanService.getColumns(eventId);
  }

  // Update a Kanban column
  @Put('columns/:id')
  updateColumn(
    @Param('id') id: string,
    @Body() updateColumnDto: UpdateKanbanColumnDto,
  ) {
    return this.kanbanService.updateColumn(+id, updateColumnDto);
  }

  // Delete a Kanban column
  @Delete('columns/:id')
  async removeColumn(@Param('id') id: number) {
    if (await this.kanbanService.removeColumn(id)) {
      return { success: true, message: 'Kanban column deleted successfully' };
    }
    return { success: false, message: 'Failed to delete Kanban column' };
  }

  // Get all tasks for a specific event/show
  @Get('tasks')
  async getTasks(@Param('eventId') eventId: number) {
    return await this.kanbanService.getTasks(eventId);
  }

  // Get all assignments for a specific event/show
  @Get('assignments')
  getAssignments(@Param('eventId') eventId: number) {
    return this.kanbanService.getAssignments(eventId);
  }

  // Create a new Kanban task
  @Post('tasks')
  createTask(@Body() createKanbanTaskDto: CreateKanbanTaskDto) {
    return this.kanbanService.createTask(createKanbanTaskDto);
  }

  // Update a Kanban task (title, description, dueDate)
  @Put('tasks/:id')
  updateTask(
    @Param('id') id: number,
    @Body() updateKanbanTaskDto: UpdateKanbanTaskDto,
  ) {
    return this.kanbanService.updateTask(id, updateKanbanTaskDto);
  }

  // Update task assignments
  @Put('tasks/:id/assignments')
  updateTaskAssignments(
    @Param('id') id: number,
    @Body() updateTaskAssignmentsDto: UpdateTaskAssignmentsDto,
  ) {
    return this.kanbanService.updateTaskAssignments(id, updateTaskAssignmentsDto);
  }

  // Update task position (columnId and/or position)
  @Put('tasks/:id/position')
  updateTaskPosition(
    @Param('id') id: number,
    @Body() updateTaskPositionDto: UpdateTaskPositionDto,
  ) {
    return this.kanbanService.updateTaskPosition(id, updateTaskPositionDto);
  }

  // Delete a Kanban task
  @Delete('tasks/:id')
  removeTask(@Param('id') id: number) {
    return this.kanbanService.removeTask(id);
  }
}

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ShowSchedule } from './entities/show-schedule.entity';
import { CreateShowScheduleDto } from './dto/create-show-schedule.dto';
import { UpdateShowScheduleDto } from './dto/update-show-schedule.dto';
import { ShowService } from './show.service';

@Injectable()
export class ShowScheduleService {
  constructor(
    @InjectRepository(ShowSchedule)
    private showScheduleRepository: Repository<ShowSchedule>,
    private showService: ShowService,
  ) { }

  async findAll(eventId: number): Promise<ShowSchedule[]> {
    return this.showScheduleRepository.find({
      where: { eventId },
      order: { startTime: 'ASC' },
    });
  }

  async create(createShowScheduleDto: CreateShowScheduleDto): Promise<ShowSchedule> {
    // Check if show exists
    const show = await this.showService.findOne(createShowScheduleDto.showId);
    if (!show) {
      throw new NotFoundException(`Show with ID ${createShowScheduleDto.showId} not found`);
    }

    // Validate time boundaries
    const startTime = new Date(createShowScheduleDto.startTime);
    const endTime = new Date(createShowScheduleDto.endTime);
    const showStartTime = new Date(show.startTime);
    const showEndTime = new Date(show.endTime);

    if (startTime < showStartTime || endTime > showEndTime) {
      throw new BadRequestException('Schedule times must be within show time boundaries');
    }

    if (startTime >= endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    // Check for overlapping schedules
    await this.checkForOverlappingSchedules(
      createShowScheduleDto.showId,
      null,
      startTime,
      endTime,
    );

    // Create new schedule
    const newSchedule = this.showScheduleRepository.create({
      ...createShowScheduleDto,
      startTime,
      endTime,
    });

    return this.showScheduleRepository.save(newSchedule);
  }

  async findAllByShow(showId: number): Promise<ShowSchedule[]> {
    // Check if show exists
    const show = await this.showService.findOne(showId);
    if (!show) {
      throw new NotFoundException(`Show with ID ${showId} not found`);
    }

    return this.showScheduleRepository.find({
      where: { showId },
      order: { startTime: 'ASC' },
    });
  }

  async findOne(id: number): Promise<ShowSchedule> {
    const schedule = await this.showScheduleRepository.findOne({
      where: { id },
      relations: ['show'],
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    return schedule;
  }

  async update(id: number, updateShowScheduleDto: UpdateShowScheduleDto): Promise<ShowSchedule> {
    // Find existing schedule
    const existingSchedule = await this.findOne(id);

    // Get show details for time validation
    const show = await this.showService.findOne(existingSchedule.showId);

    // Update times if provided, otherwise use existing times
    const startTime = updateShowScheduleDto.startTime
      ? new Date(updateShowScheduleDto.startTime)
      : existingSchedule.startTime;

    const endTime = updateShowScheduleDto.endTime
      ? new Date(updateShowScheduleDto.endTime)
      : existingSchedule.endTime;

    const showStartTime = new Date(show.startTime);
    const showEndTime = new Date(show.endTime);

    // Validate time boundaries
    if (startTime < showStartTime || endTime > showEndTime) {
      throw new BadRequestException('Schedule times must be within show time boundaries');
    }

    if (startTime >= endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    // Check for overlapping schedules (excluding this schedule)
    await this.checkForOverlappingSchedules(
      existingSchedule.showId,
      id,
      startTime,
      endTime,
    );

    // Update the schedule
    const updatedSchedule = {
      ...existingSchedule,
      ...updateShowScheduleDto,
      startTime,
      endTime,
    };

    return this.showScheduleRepository.save(updatedSchedule);
  }

  async remove(id: number): Promise<void> {
    const schedule = await this.findOne(id);
    await this.showScheduleRepository.remove(schedule);
  }

  private async checkForOverlappingSchedules(
    showId: number,
    excludeId: number | null,
    startTime: Date,
    endTime: Date,
  ): Promise<void> {
    const query = this.showScheduleRepository
      .createQueryBuilder('schedule')
      .where('schedule.showId = :showId', { showId })
      .andWhere(
        '(schedule.startTime < :endTime AND schedule.endTime > :startTime)',
        { startTime, endTime }
      );

    // Exclude the current schedule if updating
    if (excludeId) {
      query.andWhere('schedule.id != :excludeId', { excludeId });
    }

    const overlappingSchedules = await query.getCount();

    if (overlappingSchedules > 0) {
      throw new BadRequestException('This schedule overlaps with an existing schedule');
    }
  }
}

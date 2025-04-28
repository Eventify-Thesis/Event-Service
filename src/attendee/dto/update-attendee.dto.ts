import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { CreateAttendeeDto } from './create-attendee.dto';

export class UpdateAttendeeDto extends PartialType(CreateAttendeeDto) {}

import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { CreateAttendeeDto } from './create-attendee.dto';

<<<<<<< HEAD
export class UpdateAttendeeDto extends PartialType(CreateAttendeeDto) { }
=======
export class UpdateAttendeeDto extends PartialType(CreateAttendeeDto) {}
>>>>>>> db07fdf816c06999cd1af3e0ba4aba01c15b5376

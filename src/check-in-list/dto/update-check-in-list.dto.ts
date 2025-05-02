import { PartialType } from '@nestjs/mapped-types';
import { CreateCheckInListDto } from './create-check-in-list.dto';

// Make all fields optional for updates
export class UpdateCheckInListDto extends PartialType(CreateCheckInListDto) {}

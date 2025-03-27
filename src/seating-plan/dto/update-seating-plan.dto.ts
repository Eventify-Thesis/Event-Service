import { PartialType } from '@nestjs/swagger';
import { CreateSeatingPlanDto } from './create-seating-plan.dto';

export class UpdateSeatingPlanDto extends PartialType(CreateSeatingPlanDto) {}

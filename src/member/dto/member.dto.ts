import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';
import EventRole from 'src/auth/event-role/event-roles.enum';

export class AddMemberDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ enum: EventRole })
  @IsEnum(EventRole)
  @IsNotEmpty()
  role: EventRole;

  @ApiProperty()
  organizationId: string;
}

export class MemberResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  eventId: string;

  @ApiProperty({ enum: EventRole })
  role: EventRole;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class MemberListQuery {
  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  eventId?: string;
}

export class MemberListResponse {
  @ApiProperty({ type: [MemberResponse] })
  docs: MemberResponse[];

  @ApiProperty()
  totalDocs: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  totalPages: number;
}

export class UpdateMemberRoleDto {
  @ApiProperty({ enum: EventRole })
  @IsEnum(EventRole)
  @IsNotEmpty()
  role: EventRole;
}

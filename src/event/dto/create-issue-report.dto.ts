import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
  IsUrl,
} from 'class-validator';
import {
  IssueCategory,
  IssuePriority,
  IssueStatus,
} from '../entities/issue-report.entity';

export class CreateIssueReportDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(IssueCategory)
  category: IssueCategory;

  @IsOptional()
  @IsEnum(IssuePriority)
  priority?: IssuePriority;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  imageUrls?: string[];
}

export class UpdateIssueReportDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsEnum(IssueCategory)
  category?: IssueCategory;

  @IsOptional()
  @IsEnum(IssuePriority)
  priority?: IssuePriority;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  imageUrls?: string[];

  @IsOptional()
  @IsEnum(IssueStatus)
  status?: IssueStatus;
}

export class IssueReportResponseDto {
  id: number;
  userId: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: string;
  priority: IssuePriority;
  imageUrls: string[];
  createdAt: Date;
  updatedAt: Date;
}

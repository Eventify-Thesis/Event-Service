import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { IssueReportService } from '../../services/issue-report.service';
import {
  CreateIssueReportDto,
  UpdateIssueReportDto,
} from '../../dto/create-issue-report.dto';

@Controller()
export class IssueReportMicroservice {
  constructor(private readonly issueReportService: IssueReportService) {}

  @MessagePattern('createIssueReport')
  async createIssueReport(
    @Payload()
    payload: {
      userId: string;
      data: CreateIssueReportDto;
    },
  ) {
    return await this.issueReportService.createIssueReport(
      payload.userId,
      payload.data,
    );
  }

  @MessagePattern('getUserIssueReports')
  async getUserIssueReports(
    @Payload()
    payload: {
      userId: string;
      page?: number;
      limit?: number;
    },
  ) {
    return await this.issueReportService.getUserIssueReports(
      payload.userId,
      payload.page || 1,
      payload.limit || 10,
    );
  }

  @MessagePattern('getAllIssueReports')
  async getAllIssueReports(
    @Payload()
    payload: {
      page?: number;
      limit?: number;
    },
  ) {
    return await this.issueReportService.getAllIssueReports(
      payload.page || 1,
      payload.limit || 10,
    );
  }

  @MessagePattern('getIssueReport')
  async getIssueReport(
    @Payload()
    payload: {
      issueReportId: number;
      userId?: string;
    },
  ) {
    return await this.issueReportService.getIssueReportById(
      payload.issueReportId,
      payload.userId,
    );
  }

  @MessagePattern('updateIssueReport')
  async updateIssueReport(
    @Payload()
    payload: {
      issueReportId: number;
      userId: string | null;
      data: UpdateIssueReportDto;
    },
  ) {
    return await this.issueReportService.updateIssueReport(
      payload.issueReportId,
      payload.userId,
      payload.data,
    );
  }

  @MessagePattern('deleteIssueReport')
  async deleteIssueReport(
    @Payload()
    payload: {
      issueReportId: number;
      userId: string | null;
    },
  ) {
    return await this.issueReportService.deleteIssueReport(
      payload.issueReportId,
      payload.userId,
    );
  }
}

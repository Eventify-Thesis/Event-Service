import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { IssueReportService } from '../../services/issue-report.service';
import { UpdateIssueReportDto } from '../../dto/create-issue-report.dto';

@Controller('superadmin/issue-reports')
@ApiTags('SuperAdmin Issue Reports')
export class SuperAdminIssueReportController {
  constructor(private readonly issueReportService: IssueReportService) {}

  @Get()
  @ApiOperation({ summary: 'Get all issue reports for SuperAdmin' })
  @ApiOkResponse({ description: 'List of all issue reports' })
  async getAllIssueReports(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.issueReportService.getAllIssueReports(page, limit);
  }

  @Get(':issueReportId')
  @ApiOperation({ summary: 'Get specific issue report details' })
  @ApiOkResponse({ description: 'Issue report details' })
  async getIssueReport(
    @Param('issueReportId', ParseIntPipe) issueReportId: number,
  ) {
    return this.issueReportService.getIssueReportById(issueReportId);
  }

  @Put(':issueReportId')
  @ApiOperation({ summary: 'Update issue report (admin can update status)' })
  @ApiOkResponse({ description: 'Updated issue report' })
  async updateIssueReport(
    @Param('issueReportId', ParseIntPipe) issueReportId: number,
    @Body() updateIssueReportDto: UpdateIssueReportDto,
  ) {
    return this.issueReportService.updateIssueReport(
      issueReportId,
      null, // null userId means admin operation
      updateIssueReportDto,
    );
  }

  @Delete(':issueReportId')
  @ApiOperation({ summary: 'Delete issue report' })
  @ApiOkResponse({ description: 'Issue report deleted successfully' })
  async deleteIssueReport(
    @Param('issueReportId', ParseIntPipe) issueReportId: number,
  ) {
    await this.issueReportService.deleteIssueReport(issueReportId, null);
    return { message: 'Issue report deleted successfully' };
  }
}

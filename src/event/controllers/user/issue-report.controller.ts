import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { IssueReportService } from '../../services/issue-report.service';
import {
  CreateIssueReportDto,
  UpdateIssueReportDto,
} from '../../dto/create-issue-report.dto';
import { ClerkAuthGuard } from 'src/auth/clerk-auth.guard';
import RequestWithUser from 'src/auth/role/requestWithUser.interface';

@Controller('user/issue-reports')
@UseGuards(ClerkAuthGuard)
export class UserIssueReportController {
  constructor(private readonly issueReportService: IssueReportService) {}

  @Post()
  async createIssueReport(
    @Req() req: RequestWithUser,
    @Body() createIssueReportDto: CreateIssueReportDto,
  ) {
    return this.issueReportService.createIssueReport(
      req.user.id,
      createIssueReportDto,
    );
  }

  @Get()
  async getUserIssueReports(
    @Req() req: RequestWithUser,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.issueReportService.getUserIssueReports(
      req.user.id,
      page,
      limit,
    );
  }

  @Get(':issueReportId')
  async getIssueReport(
    @Req() req: RequestWithUser,
    @Param('issueReportId', ParseIntPipe) issueReportId: number,
  ) {
    return this.issueReportService.getIssueReportById(
      issueReportId,
      req.user.id,
    );
  }

  @Put(':issueReportId')
  async updateIssueReport(
    @Req() req: RequestWithUser,
    @Param('issueReportId', ParseIntPipe) issueReportId: number,
    @Body() updateIssueReportDto: UpdateIssueReportDto,
  ) {
    return this.issueReportService.updateIssueReport(
      issueReportId,
      req.user.id,
      updateIssueReportDto,
    );
  }

  @Delete(':issueReportId')
  async deleteIssueReport(
    @Req() req: RequestWithUser,
    @Param('issueReportId', ParseIntPipe) issueReportId: number,
  ) {
    return this.issueReportService.deleteIssueReport(
      issueReportId,
      req.user.id,
    );
  }
}

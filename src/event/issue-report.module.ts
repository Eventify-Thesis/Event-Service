import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IssueReport } from './entities/issue-report.entity';
import { IssueReportService } from './services/issue-report.service';
import { UserIssueReportController } from './controllers/user/issue-report.controller';
import { SuperAdminIssueReportController } from './controllers/super-admin/issue-report.controller';
import { IssueReportMicroservice } from './controllers/common/issue-report.microservice';
import { ClerkClientProvider } from '../providers/clerk-client.provider';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([IssueReport]), EmailModule],
  controllers: [
    UserIssueReportController,
    SuperAdminIssueReportController,
    IssueReportMicroservice,
  ],
  providers: [IssueReportService, ClerkClientProvider],
  exports: [IssueReportService],
})
export class IssueReportModule {}

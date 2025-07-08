import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IssueReport } from '../entities/issue-report.entity';
import {
  CreateIssueReportDto,
  UpdateIssueReportDto,
} from '../dto/create-issue-report.dto';
import { ClerkClient } from '@clerk/backend';
import { EmailService } from '../../email/email.service';

@Injectable()
export class IssueReportService {
  constructor(
    @InjectRepository(IssueReport)
    private readonly issueReportRepository: Repository<IssueReport>,
    @Inject('ClerkClient')
    private readonly clerkClient: ClerkClient,
    private readonly emailService: EmailService,
  ) {}

  async createIssueReport(
    userId: string,
    createIssueReportDto: CreateIssueReportDto,
  ): Promise<IssueReport> {
    const issueReport = this.issueReportRepository.create({
      userId,
      title: createIssueReportDto.title,
      description: createIssueReportDto.description,
      category: createIssueReportDto.category,
      priority: createIssueReportDto.priority,
    });

    const savedIssueReport = await this.issueReportRepository.save(issueReport);

    // Send email notification to support team
    try {
      // Get user details for email
      const userInfo = await this.clerkClient.users.getUser(userId);
      await this.emailService.sendIssueReport(savedIssueReport, userInfo);
    } catch (emailError) {
      console.error('Failed to send issue report email:', emailError);
      // Don't fail the request if email fails, just log it
    }

    return savedIssueReport;
  }

  async getUserIssueReports(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    issueReports: IssueReport[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const [issueReports, total] = await this.issueReportRepository.findAndCount(
      {
        where: { userId },
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      },
    );

    const enrichedIssueReports =
      await this.enrichIssueReportsWithUserDetails(issueReports);

    return {
      issueReports: enrichedIssueReports,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAllIssueReports(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    issueReports: IssueReport[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const [issueReports, total] = await this.issueReportRepository.findAndCount(
      {
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      },
    );

    const enrichedIssueReports =
      await this.enrichIssueReportsWithUserDetails(issueReports);

    return {
      issueReports: enrichedIssueReports,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getIssueReportById(
    issueReportId: number,
    userId?: string,
  ): Promise<IssueReport> {
    const issueReport = await this.issueReportRepository.findOne({
      where: { id: issueReportId },
    });

    if (!issueReport) {
      throw new NotFoundException('Issue report not found');
    }

    // If userId is provided, check if user owns this report
    if (userId && issueReport.userId !== userId) {
      throw new ForbiddenException('You can only view your own issue reports');
    }

    const enrichedIssueReports = await this.enrichIssueReportsWithUserDetails([
      issueReport,
    ]);

    return enrichedIssueReports[0];
  }

  async updateIssueReport(
    issueReportId: number,
    userId: string | null,
    updateIssueReportDto: UpdateIssueReportDto,
  ): Promise<IssueReport> {
    const issueReport = await this.issueReportRepository.findOne({
      where: { id: issueReportId },
    });

    if (!issueReport) {
      throw new NotFoundException('Issue report not found');
    }

    // Check ownership only if userId is provided (non-admin operation)
    if (userId && issueReport.userId !== userId) {
      throw new ForbiddenException(
        'You can only update your own issue reports',
      );
    }

    // Allow updating fields
    if (updateIssueReportDto.title) {
      issueReport.title = updateIssueReportDto.title;
    }
    if (updateIssueReportDto.description) {
      issueReport.description = updateIssueReportDto.description;
    }
    if (updateIssueReportDto.category) {
      issueReport.category = updateIssueReportDto.category;
    }
    if (updateIssueReportDto.priority) {
      issueReport.priority = updateIssueReportDto.priority;
    }
    if (updateIssueReportDto.imageUrls) {
      issueReport.imageUrls = updateIssueReportDto.imageUrls;
    }

    // Admin-only fields (status can only be updated by admins)
    if (!userId && updateIssueReportDto.status) {
      issueReport.status = updateIssueReportDto.status;
    }

    return this.issueReportRepository.save(issueReport);
  }

  async deleteIssueReport(
    issueReportId: number,
    userId: string | null,
  ): Promise<void> {
    const issueReport = await this.issueReportRepository.findOne({
      where: { id: issueReportId },
    });

    if (!issueReport) {
      throw new NotFoundException('Issue report not found');
    }

    // Check ownership only if userId is provided (non-admin operation)
    if (userId && issueReport.userId !== userId) {
      throw new ForbiddenException(
        'You can only delete your own issue reports',
      );
    }

    await this.issueReportRepository.remove(issueReport);
  }

  private async enrichIssueReportsWithUserDetails(
    issueReports: IssueReport[],
  ): Promise<IssueReport[]> {
    const uniqueUserIds = [
      ...new Set(issueReports.map((report) => report.userId)),
    ];
    const userDetailsMap = new Map<
      string,
      { firstName?: string; lastName?: string; imageUrl?: string }
    >();

    // Fetch user details for all unique user IDs
    const userPromises = uniqueUserIds.map(async (userId) => {
      try {
        const user = await this.clerkClient.users.getUser(userId);
        return {
          userId,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
        };
      } catch (error) {
        console.error(`Failed to fetch user details for ${userId}:`, error);
        return {
          userId,
          firstName: null,
          lastName: null,
          imageUrl: null,
        };
      }
    });

    const userDetails = await Promise.all(userPromises);

    // Create a map for quick lookup
    userDetails.forEach((user) => {
      userDetailsMap.set(user.userId, {
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      });
    });

    // Enrich issue reports with user details
    return issueReports.map((report) => {
      const userInfo = userDetailsMap.get(report.userId);
      return {
        ...report,
        userFirstName: userInfo?.firstName,
        userLastName: userInfo?.lastName,
        userImageUrl: userInfo?.imageUrl,
      } as IssueReport;
    });
  }
}

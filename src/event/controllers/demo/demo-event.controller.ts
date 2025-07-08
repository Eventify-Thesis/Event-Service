import { Controller, Post, Body, UseGuards, Req, Delete } from '@nestjs/common';
import {
  ApiTags,
  ApiOkResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PlannerEventService } from '../../services/planner-event.service';
import { SuperAdminEventService } from '../../services/superadmin-event.service';
import { CreateDraftEventDto } from '../../dto/create-draft-event.dto';
import { UpdateEventShowDto } from '../../dto/update-event-show.dto';
import { UpdateEventPaymentInfoDto } from '../../dto/update-event-payment-info.dto';
import { UpdateEventSettingDto } from '../../dto/update-event-setting.dto';
import { EventType } from '../../event.constant';
import { ClerkAuthGuard } from '../../../auth/clerk-auth.guard';
import RequestWithUser from '../../../auth/role/requestWithUser.interface';
import { ClerkClient } from '@clerk/backend';
import { Inject } from '@nestjs/common';

interface CompleteDemoEventData extends CreateDraftEventDto {
  shows?: {
    startTime: Date;
    endTime: Date;
    ticketTypes: {
      name: string;
      price: number;
      isFree: boolean;
      quantity: number;
      minTicketPurchase: number;
      maxTicketPurchase: number;
      description: string;
      imageUrl: string;
    }[];
  }[];
  paymentInfo?: UpdateEventPaymentInfoDto;
  setting?: UpdateEventSettingDto;
}

@ApiTags('Demo Events')
@Controller({
  path: 'demo/events',
})
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
export class DemoEventController {
  constructor(
    private readonly plannerEventService: PlannerEventService,
    private readonly superAdminEventService: SuperAdminEventService,
    @Inject('ClerkClient')
    private readonly clerkClient: ClerkClient,
  ) {}

  @Post('create-draft')
  @ApiBody({
    required: true,
    type: CreateDraftEventDto,
  })
  @ApiOkResponse({
    description: 'Create a demo draft event with real Clerk organization',
  })
  async createDraftEvent(
    @Body() createDraftEventDto: CreateDraftEventDto,
    @Req() req: RequestWithUser,
  ) {
    return await this.plannerEventService.upsert(req.user, createDraftEventDto);
  }

  @Post('generate-sample')
  @ApiOkResponse({
    description: 'Generate sample Vietnamese demo events with complete data',
  })
  async generateSampleEvents(@Req() req: RequestWithUser) {
    const sampleEvents = this.getSampleEventData();
    const createdEvents = [];

    for (const eventData of sampleEvents) {
      try {
        // 1. Create the basic event first
        const { shows, paymentInfo, setting, ...basicEventData } =
          eventData as CompleteDemoEventData;
        const eventDataWithoutId = { ...basicEventData, id: undefined };

        const event = await this.plannerEventService.upsert(
          req.user,
          eventDataWithoutId,
        );

        // 2. Update payment info if provided
        if (paymentInfo) {
          await this.plannerEventService.updatePaymentInfo(
            event.id,
            paymentInfo,
          );
        }

        // 3. Update settings if provided
        if (setting) {
          await this.plannerEventService.updateSetting(event.id, setting);
        }

        // 4. Create shows and ticket types if provided
        if (shows && shows.length > 0) {
          const showsData: UpdateEventShowDto = {
            shows: shows.map((show) => ({
              ...show,
              id: undefined, // Let database generate new IDs
              ticketTypes: show.ticketTypes.map((ticket) => ({
                ...ticket,
                id: undefined, // Let database generate new IDs
              })),
            })),
          };
          await this.plannerEventService.updateShows(event.id, showsData);
        }

        // 5. Get the complete event with all relations
        const completeEvent = await this.plannerEventService.findOne(event.id);
        createdEvents.push(completeEvent);
      } catch (error) {
        console.error(`Error creating event ${eventData.eventName}:`, error);
        // Continue with other events even if one fails
      }
    }

    return {
      status: 'success',
      message: `Generated ${createdEvents.length} complete sample events`,
      data: createdEvents,
    };
  }

  @Delete('cleanup-organizations')
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: {
        organizationIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of Clerk organization IDs to delete',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Delete multiple Clerk organizations',
  })
  async cleanupOrganizations(
    @Body() body: { organizationIds: string[] },
    @Req() req: RequestWithUser,
  ) {
    const { organizationIds } = body;
    const results = [];

    for (const organizationId of organizationIds) {
      try {
        const response =
          await this.clerkClient.organizations.deleteOrganization(
            organizationId,
          );
        results.push({
          organizationId,
          status: 'success',
          message: 'Organization deleted successfully',
        });
      } catch (error) {
        results.push({
          organizationId,
          status: 'error',
          message: error.message,
        });
      }
    }

    const successCount = results.filter((r) => r.status === 'success').length;
    const errorCount = results.filter((r) => r.status === 'error').length;

    return {
      status: 'completed',
      message: `Deleted ${successCount} organizations, ${errorCount} failed`,
      results,
    };
  }

  @Delete('cleanup-all-organizations')
  @ApiOkResponse({
    description: 'Delete all Clerk organizations (up to 50)',
  })
  async cleanupAllOrganizations(@Req() req: RequestWithUser) {
    try {
      // Get all organizations from Clerk (up to 50)
      const { data: organizations, totalCount } =
        await this.clerkClient.organizations.getOrganizationList({
          limit: 50,
        });

      const results = [];

      for (const organization of organizations) {
        try {
          await this.clerkClient.organizations.deleteOrganization(
            organization.id,
          );
          results.push({
            organizationId: organization.id,
            organizationName: organization.name,
            status: 'success',
            message: 'Organization deleted successfully',
          });
        } catch (error) {
          results.push({
            organizationId: organization.id,
            organizationName: organization.name,
            status: 'error',
            message: error.message,
          });
        }
      }

      const successCount = results.filter((r) => r.status === 'success').length;
      const errorCount = results.filter((r) => r.status === 'error').length;

      return {
        status: 'completed',
        message: `Found ${totalCount} organizations, deleted ${successCount} successfully, ${errorCount} failed`,
        totalFound: totalCount,
        results,
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Failed to get organizations: ${error.message}`,
      };
    }
  }

  @Delete('cleanup-all-events')
  @ApiOkResponse({
    description: 'Delete all events from the database',
  })
  async cleanupAllEvents(@Req() req: RequestWithUser) {
    try {
      // Get all events from the database using the list method with high limit
      const eventsResult = await this.superAdminEventService.list(
        null,
        { page: 1, limit: 10000 }, // High limit to get all events
        { keyword: null, status: null },
      );
      const events = eventsResult.docs;

      const results = [];

      for (const event of events) {
        try {
          await this.superAdminEventService.deleteEvent(event.id);
          results.push({
            eventId: event.id,
            eventName: event.eventName,
            organizationId: event.organizationId,
            status: 'success',
            message: 'Event deleted successfully',
          });
        } catch (error) {
          results.push({
            eventId: event.id,
            eventName: event.eventName,
            organizationId: event.organizationId,
            status: 'error',
            message: error.message,
          });
        }
      }

      const successCount = results.filter((r) => r.status === 'success').length;
      const errorCount = results.filter((r) => r.status === 'error').length;

      return {
        status: 'completed',
        message: `Found ${eventsResult.totalDocs} events, deleted ${successCount} successfully, ${errorCount} failed`,
        totalFound: eventsResult.totalDocs,
        results,
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Failed to get events: ${error.message}`,
      };
    }
  }

  private getSampleEventData(): CompleteDemoEventData[] {
    const fs = require('fs');
    const path = require('path');

    try {
      // Look for the JSON file in the source directory
      const jsonPath = path.join(process.cwd(), 'src/data/demo-events.json');
      const jsonData = fs.readFileSync(jsonPath, 'utf8');
      return JSON.parse(jsonData);
    } catch (error) {
      console.warn(
        'Could not read demo-events.json, using fallback data:',
        error.message,
      );
      return this.getFallbackEventData();
    }
  }

  private getFallbackEventData(): CompleteDemoEventData[] {
    return [
      {
        id: undefined,
        eventName: 'Liveshow Hà Anh Tuấn - Trời Sao Đêm Nay',
        eventDescription:
          'Liveshow âm nhạc đặc biệt với những ca khúc hit của Hà Anh Tuấn',
        categories: ['music'],
        categoriesIds: ['fc981c1b-485d-497d-b539-b8e73c4376bb'],
        eventType: EventType.OFFLINE,
        orgName: 'Công ty Giải trí Hà Anh Tuấn',
        orgDescription: 'Công ty tổ chức sự kiện âm nhạc chuyên nghiệp',
        orgLogoUrl:
          'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
        eventLogoUrl:
          'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
        eventBannerUrl:
          'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200&h=600&fit=crop',
        venueName: 'Cung Văn hóa Hữu nghị Việt Xô',
        cityId: 1,
        districtId: undefined,
        wardId: 1,
        street: '91 Trần Hưng Đạo',
        latitude: 21.0285,
        longitude: 105.8542,
        formattedAddress: '91 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội, Vietnam',
        placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
      },
      {
        id: undefined,
        eventName: 'Hội chợ Công nghệ Việt Nam 2025',
        eventDescription:
          'Hội chợ công nghệ lớn nhất Việt Nam với sự tham gia của hàng trăm doanh nghiệp',
        categories: ['technology'],
        categoriesIds: ['9671bdf8-484e-4922-8835-cc800cc7ba3f'],
        eventType: EventType.OFFLINE,
        orgName: 'Hiệp hội Công nghệ Việt Nam',
        orgDescription: 'Tổ chức hàng đầu về công nghệ tại Việt Nam',
        orgLogoUrl:
          'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop',
        eventLogoUrl:
          'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop',
        eventBannerUrl:
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=600&fit=crop',
        venueName: 'Trung tâm Hội chợ Triển lãm Sài Gòn',
        cityId: 79,
        districtId: undefined,
        wardId: 25747,
        street: '799 Nguyễn Văn Linh',
        latitude: 10.7769,
        longitude: 106.7009,
        formattedAddress:
          '799 Nguyễn Văn Linh, Phường Tân Phú, Quận 7, TP. Hồ Chí Minh',
        placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY5',
      },
      {
        id: undefined,
        eventName: 'Giải Marathon Hà Nội 2025',
        eventDescription:
          'Giải chạy marathon quốc tế tại Hà Nội với các cự ly 5km, 10km, 21km và 42km',
        categories: ['sport'],
        categoriesIds: ['4247769b-251e-4909-8c89-3af54d648374'],
        eventType: EventType.OFFLINE,
        orgName: 'Liên đoàn Điền kinh Việt Nam',
        orgDescription: 'Tổ chức thể thao chuyên nghiệp',
        orgLogoUrl:
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
        eventLogoUrl:
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
        eventBannerUrl:
          'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=1200&h=600&fit=crop',
        venueName: 'Quảng trường Đông Kinh Nghĩa Thục',
        cityId: 1,
        districtId: undefined,
        wardId: 1,
        street: 'Phố Đinh Tiên Hoàng',
        latitude: 21.0285,
        longitude: 105.8542,
        formattedAddress: 'Phố Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội, Vietnam',
        placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY6',
      },
    ];
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeneratePostDto } from './dto/generate-post.dto';
import { SchedulePostDto } from './dto/schedule-post.dto';
import { FacebookService } from '../facebook/facebook.service';

@Injectable()
export class MarketingService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    private configService: ConfigService,
    private facebookService: FacebookService,
  ) {
    this.genAI = new GoogleGenerativeAI(this.configService.get('GEMINI_API_KEY'));
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  async generatePost(data: GeneratePostDto): Promise<string> {
    const basePrompt = `Create an engaging Facebook post for the following event:
      Event Name: ${data.eventName}
      Description: ${data.eventDescription}
      Type: ${data.eventType}
      Organizer: ${data.orgName}
      Venue: ${data.venueName || 'TBA'}
      Date: ${data.date}
      Categories: ${data.categories?.join(', ') || 'Various'}
    `;

    const customPrompt = data.customPrompt || 'Make it engaging and professional';

    const prompt = `Write a Facebook post to promote this event:
${basePrompt}

Custom instructions: ${customPrompt}

Write the post in HTML format with proper formatting. Include relevant emojis and icons where appropriate (e.g. 📅 for date, 📍 for location, 🎟️ for tickets, etc). Make sure to use semantic HTML tags and maintain proper spacing.`;
    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  async getFacebookPages(userId: string): Promise<any[]> {
    return this.facebookService.getUserPages(userId);
  }

  async schedulePost(eventId: string, userId: string, schedulePostDto: SchedulePostDto): Promise<any> {
    return this.facebookService.schedulePost(
      eventId,
      userId,
      schedulePostDto.pageId,
      schedulePostDto.content,
      schedulePostDto.scheduledTime,
      schedulePostDto.imageUrls
    );
  }
}

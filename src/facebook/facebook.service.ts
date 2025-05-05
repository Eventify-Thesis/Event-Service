import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { FacebookToken } from './entities/facebook-token.entity';
import { FacebookPost } from './entities/facebook-post.entity';
import { FacebookPostDto } from './dto/facebook-post.dto';

@Injectable()
export class FacebookService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(FacebookToken)
    private facebookTokenRepository: Repository<FacebookToken>,
    @InjectRepository(FacebookPost)
    private facebookPostRepository: Repository<FacebookPost>,
  ) { }

  async getAccessToken(code: string, userId: string): Promise<void> {
    try {
      const clientId = this.configService.get('FACEBOOK_APP_ID');
      const clientSecret = this.configService.get('FACEBOOK_APP_SECRET');
      const redirectUri = this.configService.get('FACEBOOK_REDIRECT_URI');

      // Get short-lived token
      const shortLivedTokenResponse = await axios.get(
        'https://graph.facebook.com/v18.0/oauth/access_token',
        {
          params: {
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            code,
          },
        },
      );

      const shortLivedToken = shortLivedTokenResponse.data.access_token;

      // Exchange for long-lived token
      const longLivedTokenResponse = await axios.get(
        'https://graph.facebook.com/v18.0/oauth/access_token',
        {
          params: {
            grant_type: 'fb_exchange_token',
            client_id: clientId,
            client_secret: clientSecret,
            fb_exchange_token: shortLivedToken,
          },
        },
      );


      // Get user's pages
      const pages = await this.getUserPagesFromToken(longLivedTokenResponse.data.access_token);

      let tokenExpiresAt: Date | undefined = undefined;
      if (longLivedTokenResponse.data.expires_in) {
        tokenExpiresAt = new Date();
        tokenExpiresAt.setSeconds(tokenExpiresAt.getSeconds() + longLivedTokenResponse.data.expires_in);
      }
      // Store tokens
      await this.checkGrantedPermissions(longLivedTokenResponse.data.access_token);

      const facebookToken = this.facebookTokenRepository.create({
        userId,
        longLivedUserToken: longLivedTokenResponse.data.access_token,
        pageTokens: pages.map(page => ({
          pageId: page.id,
          pageName: page.name,
          accessToken: page.accessToken,
        })),
        tokenExpiresAt,
      });

      await this.facebookTokenRepository.save(facebookToken);
      return longLivedTokenResponse.data.access_token;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }

  async getUserPagesFromToken(accessToken: string) {
    try {
      const response = await axios.get(
        'https://graph.facebook.com/v18.0/me/accounts',
        {
          params: {
            access_token: accessToken,
            fields: 'id,name,access_token',
          },
        },
      );

      return response.data.data.map((page: any) => ({
        id: page.id,
        name: page.name,
        accessToken: page.access_token,
      }));
    } catch (error) {
      console.error('Error fetching Facebook pages from token:', error.response?.data || error.message);
      throw new Error('Failed to fetch Facebook pages from token');
    }
  }

  async getUserPages(userId: string) {
    const tokenRecord = await this.getStoredTokens(userId);

    if (!tokenRecord) {
      throw new Error('No Facebook token found for this user');
    }

    try {
      const response = await axios.get(
        'https://graph.facebook.com/v18.0/me/accounts',
        {
          params: {
            access_token: tokenRecord.longLivedUserToken,
            fields: 'id,name,access_token',
          },
        },
      );

      const pages = response.data.data.map((page: any) => ({
        id: page.id,
        name: page.name,
      }));

      return pages;
    } catch (error) {
      console.error('Error fetching Facebook pages:', error.response?.data || error.message);
      throw new Error('Failed to fetch Facebook pages');
    }
  }

  async getStoredTokens(userId: string) {
    const tokens = await this.facebookTokenRepository.findOne({
      where: { userId },
    });
    return tokens;
  }

  async getPageAccessToken(userId: string, pageId: string) {
    const tokens = await this.getStoredTokens(userId);
    if (!tokens) {
      throw new Error('No Facebook tokens found for this user');
    }
    console.log('Tokens:', tokens);

    const pageToken: any = tokens.pageTokens.find((p: any) => p.pageId === pageId);
    if (!pageToken) {
      throw new Error('No access token found for this page');
    }
    console.log('Page token:', pageToken.accessToken);

    return pageToken.accessToken;
  }

  async checkGrantedPermissions(userAccessToken: string): Promise<{ [permission: string]: string }> {
    try {
      const response = await axios.get(
        'https://graph.facebook.com/v18.0/me/permissions',
        {
          params: {
            access_token: userAccessToken,
          },
        },
      );

      const granted: { [permission: string]: string } = {};
      for (const perm of response.data.data) {
        granted[perm.permission] = perm.status;
      }

      console.log('Granted Facebook permissions:', granted);
      return granted;
    } catch (error) {
      console.error('Failed to check Facebook permissions:', error.response?.data || error.message);
      throw new Error('Could not verify Facebook permissions');
    }
  }


  private async uploadImage(pageId: string, accessToken: string, imageUrl: string): Promise<string> {
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${pageId}/photos`,
        {
          url: imageUrl,
          published: false,
        },
        {
          params: { access_token: accessToken },
        }
      );
      return response.data.id;
    } catch (error) {
      console.error('Failed to upload image:', error.response?.data || error.message);
      throw new Error('Failed to upload image to Facebook');
    }
  }

  async schedulePost(eventId: string, userId: string, pageId: string, message: string, scheduledTime: string, imageUrls: string[] = []) {

    try {
      const accessToken = await this.getPageAccessToken(userId, pageId);
      const now = new Date();
      const targetTime = new Date(scheduledTime);
      const isImmediate = targetTime <= now;

      // Upload all images first if any
      const mediaIds = [];
      if (imageUrls && imageUrls.length > 0) {
        for (const imageUrl of imageUrls) {
          const mediaId = await this.uploadImage(pageId, accessToken, imageUrl);
          mediaIds.push({ media_fbid: mediaId });
        }
      }

      // Prepare post data
      const postData: any = {
        message,
        published: isImmediate,
        ...(isImmediate ? {} : {
          scheduled_publish_time: Math.floor(targetTime.getTime() / 1000)
        })
      };

      // Add attached media if we have any
      if (mediaIds.length > 0) {
        postData.attached_media = mediaIds;
      }

      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${pageId}/feed`,
        postData,
        {
          params: { access_token: accessToken }
        }
      );

      // Log the post for tracking
      console.log(`Facebook post ${isImmediate ? 'published' : 'scheduled'} for event ${eventId}:`, {
        postId: response.data.id,
        pageId,
        scheduledTime: isImmediate ? now.toISOString() : scheduledTime,
        isImmediate
      });

      const facebookPost = this.facebookPostRepository.create({
        userId,
        eventId,
        pageId,
        postId: response.data.id,
        message,
        imageUrls,
        scheduledAt: targetTime
      });

      await this.facebookPostRepository.save(facebookPost);

      return {
        success: true,
        data: response.data,
        message: `Post successfully ${isImmediate ? 'published' : 'scheduled'}`
      };
    } catch (error) {
      console.error('Error with Facebook post:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to process Facebook post');
    }
  }

  async getPostStats(pageId: string, postId: string, accessToken: string) {
    const url = `https://graph.facebook.com/v18.0/${postId}`;
    const res = await axios.get(url, {
      params: {
        access_token: accessToken,
        fields: 'shares,reactions.summary(true),comments.summary(true)',
      },
    });

    return {
      likes: res.data.reactions?.summary?.total_count || 0,
      comments: res.data.comments?.summary?.total_count || 0,
      shares: res.data.shares?.count || 0,
    };
  }


  async getPosts(pageId: string, userId: string): Promise<FacebookPostDto[]> {
    try {
      const posts = await this.facebookPostRepository.find({
        where: {
          pageId,
        },
      });

      const accessToken = await this.getPageAccessToken(userId, pageId);
      const sortedPosts = posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      const dtos = sortedPosts.map(async post => {
        const stats = await this.getPostStats(post.pageId, post.postId, accessToken);
        const dto = new FacebookPostDto();
        dto.id = post.id;
        dto.message = post.message;
        dto.imageUrls = post.imageUrls;
        dto.scheduledAt = post.scheduledAt;
        dto.likes = stats.likes;
        dto.comments = stats.comments;
        dto.shares = stats.shares;
        return dto;
      });
      return Promise.all(dtos);
    } catch (error) {
      console.error('Error fetching Facebook posts:', error.response?.data || error.message);
      throw new Error('Failed to fetch Facebook posts');
    }
  }

  async checkAuth(userId: string): Promise<boolean> {
    const tokenRecord = await this.getStoredTokens(userId);
    if (!tokenRecord) {
      return false;
    }
    return true;
  }

  async disconnect(userId: string): Promise<void> {
    await this.facebookTokenRepository.delete({ userId });
  }
}

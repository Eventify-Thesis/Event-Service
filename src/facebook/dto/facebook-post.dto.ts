export class FacebookPostDto {
  id: string;
  pageId: string;
  postId: string;
  message: string;
  imageUrls: string[];
  scheduledAt: Date;
  likes: number;
  comments: number;
  shares: number;
}

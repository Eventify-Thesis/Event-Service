export class FacebookPostDto {
    id: string;
    message: string;
    imageUrls: string[];
    scheduledAt: Date;
    likes: number;
    comments: number;
    shares: number;
}

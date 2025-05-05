import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('facebook_posts')
export class FacebookPost {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({ name: 'event_id' })
    eventId: string;

    @Column({ name: 'page_id' })
    pageId: string;

    @Column({ name: 'post_id' })
    postId: string;

    @Column({ name: 'message' })
    message: string;

    @Column({ name: 'image_urls', type: 'jsonb', nullable: true })
    imageUrls: string[];

    @Column({ name: 'scheduled_at', type: 'timestamp' })
    scheduledAt: Date;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}

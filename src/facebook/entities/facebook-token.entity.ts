import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('facebook_tokens')
export class FacebookToken {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'long_lived_user_token' })
  longLivedUserToken: string;

  @Column({ name: 'page_tokens', type: 'json' })
  pageTokens: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamp', name: 'token_expires_at' })
  tokenExpiresAt: Date;
}

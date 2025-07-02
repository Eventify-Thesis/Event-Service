import { EntityRepository, Repository } from 'typeorm';
import { FacebookPost } from '../entities/facebook-post.entity';

@EntityRepository(FacebookPost)
export class FacebookPostRepository extends Repository<FacebookPost> {
  // Add custom repository methods here if needed
}

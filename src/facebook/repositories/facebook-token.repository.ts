import { EntityRepository, Repository } from 'typeorm';
import { FacebookToken } from '../entities/facebook-token.entity';

@EntityRepository(FacebookToken)
export class FacebookTokenRepository extends Repository<FacebookToken> {
  // Add custom repository methods here if needed
}

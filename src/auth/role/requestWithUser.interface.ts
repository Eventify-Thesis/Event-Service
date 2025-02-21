import { User } from '@clerk/backend';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: User;
}

export default RequestWithUser;

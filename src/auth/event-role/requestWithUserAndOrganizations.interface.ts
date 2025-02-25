import { User } from '@clerk/backend';
import { Request } from 'express';

interface RequestWithUserAndOrganizations extends Request {
  user: {
    user: User;
    organizations: any;
  };
}

export default RequestWithUserAndOrganizations;

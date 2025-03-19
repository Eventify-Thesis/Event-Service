import { SetMetadata } from '@nestjs/common';
import { EventRole } from './event-roles.enum';

export const EVENT_ROLES_KEY = 'event_roles';
export const EventRoles = (...event_roles: EventRole[]) =>
  SetMetadata(EVENT_ROLES_KEY, event_roles);

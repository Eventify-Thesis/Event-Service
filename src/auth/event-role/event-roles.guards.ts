import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
  Type,
} from '@nestjs/common';
import { EventRole } from './event-roles.enum';
import { AuthGuard } from '@nestjs/passport';
import RequestWithUser from '../role/requestWithUser.interface';

const EventRoleGuard = (
  eventRoles: EventRole | EventRole[],
): Type<CanActivate> => {
  @Injectable()
  class RoleGuardMixin extends AuthGuard('clerk') {
    async canActivate(context: ExecutionContext) {
      await super.canActivate(context);

      const request = context.switchToHttp().getRequest<RequestWithUser>();

      const eventId = request.params.eventId || request.body.id;

      if (!eventId) return true;

      // Convert Clerk roles to EventRole format
      const eventEntries = Object.entries(
        request.user.publicMetadata.organizations || {},
      ).map(([id, clerkRole]) => {
        const role = (clerkRole as string)
          .replace('org:', '')
          .toUpperCase() as EventRole;
        const eventId = id.split(':')[0];
        return [eventId, role] as [string, EventRole];
      });

      // Convert single role to array for consistent checking
      const requiredRoles = Array.isArray(eventRoles)
        ? eventRoles
        : [eventRoles];
      // Check both organization membership and role

      const hasOrganizationAccess = eventEntries.some(
        ([event, role]) => event === eventId && requiredRoles.includes(role),
      );

      return hasOrganizationAccess;
    }
  }
  return mixin(RoleGuardMixin);
};

export default EventRoleGuard;

import { CanActivate, ExecutionContext, Injectable, mixin, Type } from '@nestjs/common';
import RequestWithUserAndOrganizations from './requestWithUserAndOrganizations.interface';
import EventRole from './event-roles.enum';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { ModuleRef } from '@nestjs/core';

const EventRoleGuard = (eventRoles: EventRole | EventRole[]): Type<CanActivate> => {
  @Injectable()
  class RoleGuardMixin extends AuthGuard('clerk') {
    constructor(
      private moduleRef: ModuleRef,
    ) {
      super();
    }

    private get authService(): AuthService {
      return this.moduleRef.get(AuthService, { strict: false });
    }

    async canActivate(context: ExecutionContext) {
      await super.canActivate(context);
      
      const request = context.switchToHttp().getRequest<RequestWithUserAndOrganizations>();
    
      const eventId = request.params.eventId || request.body.id;
      if(!eventId) return true;
      const event = await this.authService.findOne({ _id: eventId });
      const eventOrgId = event?.organizationId;
      
      // Convert Clerk roles to EventRole format
      const organizationEntries = Object.entries(request.user.organizations || {})
        .map(([orgId, clerkRole]) => {
          const role = (clerkRole as string).replace('org:', '').toUpperCase() as EventRole;
          return [orgId, role] as [string, EventRole];
        });

        // Find the user's role in the event's organization
      const [_, userRole] = organizationEntries.find(([orgId]) => orgId === eventOrgId) || [];
      
      // Convert single role to array for consistent checking

      console.log(eventRoles, userRole)
      console.log(eventOrgId, organizationEntries)
      const requiredRoles = Array.isArray(eventRoles) ? eventRoles : [eventRoles];
      // Check both organization membership and role
      const hasOrganizationAccess = organizationEntries.some(([orgId]) => orgId === eventOrgId);
      const hasRoleAccess = requiredRoles.includes(userRole);
      
      return hasOrganizationAccess && hasRoleAccess;
    }
  }
  return mixin(RoleGuardMixin);
};

export default EventRoleGuard;
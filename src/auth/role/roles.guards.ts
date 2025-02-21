import Role from './roles.enum';
import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import RequestWithUser from './requestWithUser.interface';
import { ClerkAuthGuard } from '../clerk-auth.guard';

const RoleGuard = (role: Role): Type<CanActivate> => {
  class RoleGuardMixin extends ClerkAuthGuard {
    async canActivate(context: ExecutionContext) {
      await super.canActivate(context);

      const request = context.switchToHttp().getRequest<RequestWithUser>();
      const user = request.user;

      return user?.publicMetadata?.role === role;
    }
  }

  return mixin(RoleGuardMixin);
};

export default RoleGuard;

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const BodyParamUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return {
      ...request.body,
      userAuth: request.user['sub'] || null,
      paramId: request.params.id || null,
    };
  },
);

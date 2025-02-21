import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const BodyId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return {
      ...request.body,
      _id: request.params.id || null,
    };
  },
);

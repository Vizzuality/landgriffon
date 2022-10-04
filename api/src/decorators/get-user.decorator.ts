import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'modules/users/user.entity';

export const GetUser: any = createParamDecorator(
  (_data: unknown, context: ExecutionContext): User => {
    const request: any = context.switchToHttp().getRequest();
    return request.user;
  },
);

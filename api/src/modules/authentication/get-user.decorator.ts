import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'modules/users/user.entity';

export const GetUser = createParamDecorator(
  (_data, context: ExecutionContext): User => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);

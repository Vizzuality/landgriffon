import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from 'modules/users/user.entity';

export const GetUser: any = createParamDecorator(
  (_data: unknown, context: ExecutionContext): User => {
    const request: any = context.switchToHttp().getRequest();
    if (!request.user) {
      throw new UnauthorizedException();
    }
    return request.user;
  },
);

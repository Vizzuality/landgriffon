import { Controller, Request } from '@nestjs/common';
import { User } from 'modules/users/user.entity';

// Request object augmented with user data
export interface RequestWithAuthenticatedUser extends Request {
  user: User;
}

@Controller()
export class AppController {
  constructor(private readonly _service: any) {}
}

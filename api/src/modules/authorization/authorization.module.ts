import { Module } from '@nestjs/common';
import { RequestScopeModule } from 'nj-request-scope';

import { AccessControl } from 'modules/authorization/access-control.service';

export const ACCESS_CONTROL: string = 'ACCESS_CONTROL';

@Module({
  imports: [RequestScopeModule],
  providers: [AccessControl],
  exports: [AccessControl],
})
export class AuthorizationModule {}

import { Module } from '@nestjs/common';
import { RequestScopeModule } from 'nj-request-scope';

import { AccessControl } from 'modules/authorization/access-control.service';
import { ScenariosAccessControl } from 'modules/authorization/modules/scenarios.access-control.service';

@Module({
  imports: [RequestScopeModule],
  providers: [AccessControl, ScenariosAccessControl],
  exports: [AccessControl, ScenariosAccessControl],
})
export class AuthorizationModule {}

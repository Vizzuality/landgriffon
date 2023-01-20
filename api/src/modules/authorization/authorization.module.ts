import { Module } from '@nestjs/common';
import { RequestScopeModule } from 'nj-request-scope';

import { AccessControl } from 'modules/authorization/access-control.service';
import { ScenariosAccessControl } from 'modules/authorization/modules/scenarios.access-control.service';
import { AuthorizationService } from 'modules/authorization/authorization.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from 'modules/authorization/permissions/permissions.entity';
import { Role } from 'modules/authorization/roles/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission]), RequestScopeModule],
  providers: [AuthorizationService, AccessControl, ScenariosAccessControl],
  exports: [AuthorizationService, AccessControl, ScenariosAccessControl],
})
export class AuthorizationModule {}

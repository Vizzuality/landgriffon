import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from 'modules/users/users.controller';
import { UsersService } from 'modules/users/users.service';
import { AuthenticationModule } from 'modules/authentication/authentication.module';
import { User } from 'modules/users/user.entity';
import { UserCommand } from 'modules/users/user.command';
import { Role } from 'modules/authorization/roles/role.entity';
import { UserRepository } from 'modules/users/user.repository';
import { AuthorizationModule } from 'modules/authorization/authorization.module';
import { ScenariosModule } from 'modules/scenarios/scenarios.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),
    forwardRef(() => AuthenticationModule),
    AuthorizationModule,
    ScenariosModule,
  ],
  providers: [UsersService, UserCommand, UserRepository],
  controllers: [UsersController],
  exports: [UsersService, UserCommand, UserRepository],
})
export class UsersModule {}

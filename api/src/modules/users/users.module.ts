import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from 'modules/users/users.controller';
import { UsersService } from 'modules/users/users.service';
import { AuthenticationModule } from 'modules/authentication/authentication.module';
import { UserRepository } from 'modules/users/user.repository';
import { UserCommand } from 'modules/users/user.command';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRepository]),
    forwardRef(() => AuthenticationModule),
  ],
  providers: [UsersService, UserCommand],
  controllers: [UsersController],
  exports: [UsersService, UserCommand],
})
export class UsersModule {}

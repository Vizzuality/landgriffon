import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from 'modules/users/users.controller';
import { UsersService } from 'modules/users/users.service';
import { AuthenticationModule } from 'modules/authentication/authentication.module';
import { UserRepository } from 'modules/users/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRepository]),
    forwardRef(() => AuthenticationModule),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}

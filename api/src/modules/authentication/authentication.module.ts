import { forwardRef, Logger, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'modules/users/users.module';
import * as config from 'config';
import { AuthenticationController } from 'modules/authentication/authentication.controller';
import { AuthenticationService } from 'modules/authentication/authentication.service';
import { JwtStrategy } from 'modules/authentication/strategies/jwt.strategy';
import { LocalStrategy } from 'modules/authentication/strategies/local.strategy';
import { ApiEventsModule } from 'modules/api-events/api-events.module';
import { UserRepository } from 'modules/users/user.repository';

export const logger: Logger = new Logger('Authentication');

@Module({
  imports: [
    ApiEventsModule,
    forwardRef(() => UsersModule),
    PassportModule,
    JwtModule.register({
      secret: config.get('auth.jwt.secret'),
      signOptions: { expiresIn: config.get('auth.jwt.expiresIn') },
    }),
    TypeOrmModule.forFeature([UserRepository]),
  ],
  providers: [AuthenticationService, LocalStrategy, JwtStrategy],
  controllers: [AuthenticationController],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}

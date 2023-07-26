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
import { User } from 'modules/users/user.entity';
import { PasswordValidation } from 'decorators/password-validator.decorator';
import { AuthorizationModule } from 'modules/authorization/authorization.module';
import { NotificationsModule } from 'modules/notifications/notifications.module';

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
    TypeOrmModule.forFeature([User]),
    AuthorizationModule,
    NotificationsModule,
  ],
  providers: [
    AuthenticationService,
    LocalStrategy,
    JwtStrategy,
    PasswordValidation,
    {
      provide: 'PASSWORD_INCLUDE_UPPER_CASE',
      useValue:
        `${config.get('auth.password.includeUpperCase')}`.toLowerCase() ===
        'true',
    },
    {
      provide: 'PASSWORD_INCLUDE_NUMERICS',
      useValue:
        `${config.get('auth.password.includeNumerics')}`.toLowerCase() ===
        'true',
    },
    {
      provide: 'PASSWORD_INCLUDE_SPECIAL_CHARACTERS',
      useValue:
        `${config.get(
          'auth.password.includeSpecialCharacters',
        )}`.toLowerCase() === 'true',
    },
    {
      provide: 'PASSWORD_MIN_LENGTH',
      useValue: parseInt(`${config.get('auth.password.minLength')}`),
    },
  ],
  controllers: [AuthenticationController],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}

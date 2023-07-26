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
import { AppConfig } from 'utils/app.config';

export const logger: Logger = new Logger('Authentication');
const getPasswordResetUrl = (): string => {
  const clientUrl: string = AppConfig.get('client.url');
  const clientPort: string = AppConfig.get('client.port');
  const passwordResetUrl: string = AppConfig.get('auth.password.resetUrl');
  const protocol: string =
    process.env.NODE_ENV === 'production' ? 'https' : 'http';
  if (!clientUrl || !clientPort || !passwordResetUrl) {
    logger.error('Missing client url, port or password reset url');
  }
  return `${protocol}://${clientUrl}:${clientPort}${passwordResetUrl}`;
};

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
      provide: 'PASSWORD_RESET_URL',
      useValue: getPasswordResetUrl(),
    },

    {
      provide: 'PASSWORD_INCLUDE_UPPER_CASE',
      useValue: AppConfig.getBoolean('auth.password.includeUpperCase'),
    },
    {
      provide: 'PASSWORD_INCLUDE_NUMERICS',
      useValue: AppConfig.getBoolean('auth.password.includeNumerics'),
    },
    {
      provide: 'PASSWORD_INCLUDE_SPECIAL_CHARACTERS',
      useValue: AppConfig.getBoolean('auth.password.includeSpecialCharacters'),
    },
    {
      provide: 'PASSWORD_MIN_LENGTH',
      useValue: AppConfig.getInt('auth.password.minLength'),
    },
  ],
  controllers: [AuthenticationController],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}

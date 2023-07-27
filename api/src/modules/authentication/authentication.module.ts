import { forwardRef, Module } from '@nestjs/common';
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
import { PasswordMailService } from 'modules/authentication/password-mail.service';
import { getPasswordSettingUrl } from 'modules/authentication/utils/authentication.utils';

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
    PasswordMailService,
    {
      provide: 'PASSWORD_ACTIVATION_URL',
      useValue: getPasswordSettingUrl('activation'),
    },
    {
      provide: 'PASSWORD_RESET_URL',
      useValue: getPasswordSettingUrl('reset'),
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

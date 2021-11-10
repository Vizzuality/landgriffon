import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { AuthenticationService } from 'modules/authentication/authentication.service';
import { User } from 'modules/users/user.entity';

import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authenticationService: AuthenticationService) {
    super();
  }

  /**
   * Implementation for PassportStrategy.validate() for username+password authn.
   */
  async validate(email: string, password: string): Promise<User> {
    const user: User | null = await this.authenticationService.validateUser({
      email,
      password,
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}

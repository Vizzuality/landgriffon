import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as config from 'config';
import {
  AuthenticationService,
  JwtDataPayload,
} from 'modules/authentication/authentication.service';

import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from 'modules/users/user.entity';
import { UserRepository } from 'modules/users/user.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authenticationService: AuthenticationService,

    private readonly userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('auth.jwt.secret'),
    });
  }

  /**
   * Validate that the email in the JWT payload's `sub` property matches that of
   * an existing user.
   */
  public async validate({ sub: email }: JwtDataPayload): Promise<User> {
    const user: User | null = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}

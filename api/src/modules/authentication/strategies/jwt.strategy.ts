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
   * an existing user, and that the token was not revoked (removed from the list
   * of issued tokens).
   */
  public async validate({
    sub: email,
    tokenId,
  }: JwtDataPayload): Promise<User> {
    const user = await this.userRepository.findByEmail(email);

    //TODO: Ensure token is valid according to current data on the user

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}

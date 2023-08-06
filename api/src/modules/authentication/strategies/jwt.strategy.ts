import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtDataPayload } from 'modules/authentication/authentication.service';
import { getSecretByTokenType } from 'modules/authentication/utils/authentication.utils';
import { User } from 'modules/users/user.entity';
import { UserRepository } from 'modules/users/user.repository';
import * as jwt from 'jsonwebtoken';

/**
 * @todo: We are handling different token strategies by using secretOrKeyProvider, and the static
 *        getSecretFromToken method. This is not ideal, explore how to override global at route handler level
 *        other global or controller level guards
 */

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userRepo: UserRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: JwtStrategy.getSecretFromToken,
    });
  }

  async validate(payload: JwtDataPayload): Promise<any> {
    const { sub: email } = payload;
    const user: User | null = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  static getSecretFromToken(
    req: Request,
    rawJwtToken: string,
    done: any,
  ): void {
    try {
      const { tokenType } = jwt.decode(rawJwtToken) as JwtDataPayload;
      const secret: string = getSecretByTokenType(tokenType);

      done(null, secret);
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}

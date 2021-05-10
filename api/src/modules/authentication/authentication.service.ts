import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { User } from 'modules/users/user.entity';
import { UsersService } from 'modules/users/users.service';
import { hash, compare, genSalt } from 'bcrypt';

import { InjectRepository } from '@nestjs/typeorm';
import { IssuedAuthnToken } from 'modules/authentication/issued-authn-token';
import ms = require('ms');
import { SignUpDto } from 'modules/authentication//dto/sign-up.dto';
import { ApiEventsService } from 'modules/api-events/api-events.service';
import { API_EVENT_KINDS, ApiEvent } from 'modules/api-events/api-event.entity';
import { v4 } from 'uuid';
import * as ApiEventsUserData from 'modules/api-events/dto/apiEvents.user.data.dto';
import { UserRepository } from 'modules/users/user.repository';
import * as config from 'config';

/**
 * Access token for the app: key user data and access token
 */
export interface AccessToken {
  /**
   * Whitelisted user metadata
   */
  user: Partial<User>;

  /**
   * Signed JWT
   */
  accessToken: string;
}

/**
 * JWT payload (decoded)
 */
export interface JwtDataPayload {
  /**
   * Username (user email address).
   */
  sub: string;

  /**
   * Unique id of the JWT token.
   *
   * This is used to check tokens presented to the API against revoked tokens.
   */
  tokenId: string;

  /**
   * Issued At: epoch timestamp in seconds, UTC.
   */
  iat: number;

  /**
   * Expiration time: epoch timestamp in seconds, UTC.
   */
  exp: number;
}

@Injectable()
export class AuthenticationService {
  private readonly logger: Logger = new Logger(AuthenticationService.name);

  constructor(
    private readonly apiEventsService: ApiEventsService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {}

  /**
   * Validate that an active user matching the `email` provided exists, and that
   * the password provided compares with the hashed password stored for the
   * user.
   *
   * @debt Use a named interface for the parameter types.
   */
  async validateUser({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);
    const isUserActive = user && user.isActive && !user.isDeleted;

    if (
      user &&
      isUserActive &&
      (await compare(
        await hash(password, user.salt),
        await hash(user.password, user.salt),
      ))
    ) {
      return user;
    }
    return null;
  }

  /**
   * Create a new user from the signup data provided.
   *
   * @todo Allow to set all of a user's data on signup, if needed.
   * @todo Implement email verification.
   */
  async createUser(signupDto: SignUpDto): Promise<Partial<User>> {
    const user = new User();
    user.displayName = signupDto.displayName;
    user.salt = await genSalt();
    user.password = await hash(signupDto.password, user.salt);
    user.email = signupDto.email;
    user.isActive = !config.get('auth.requireUserAccountActivation');
    const newUser = UsersService.getSanitizedUserMetadata(
      await this.userRepository.save(user),
    );
    if (!newUser) {
      throw new InternalServerErrorException('Error while creating a new user');
    }
    await this.apiEventsService.create({
      topic: newUser.id,
      kind: API_EVENT_KINDS.user__signedUp__v1alpha1,
    });
    const validationToken = v4();
    const apiEvent: ApiEvent = await this.apiEventsService.create({
      topic: newUser.id,
      kind: API_EVENT_KINDS.user__accountActivationTokenGenerated__v1alpha1,
      data: {
        validationToken: validationToken,
        exp:
          Date.now() +
          ms(
            '1d',
          ) /** @debt The TTL of validation tokens should be set via config. */,
        sub: newUser.email,
      },
    });
    /**
     * This is a small aid to help with manual QA :).
     */
    if (process.env['NODE_ENV'] === 'development') {
      this.logger.log(
        `An account was created for ${newUser.email}. Please validate the account via GET /auth/validate-account/${newUser.id}/${validationToken}.`,
      );
    }
    return newUser;
  }

  /**
   * Validate a user activation token.
   *
   * We avoid possible double-spending of an activation token by deleting the
   * actual token issuance event after it has been validated.
   */
  async validateActivationToken(
    token: Pick<
      ApiEventsUserData.ActivationTokenGeneratedV1Alpha1,
      'validationToken' | 'sub'
    >,
  ): Promise<true | never> {
    const invalidOrExpiredActivationTokenMessage =
      'Invalid or expired activation token.';
    const event = await this.apiEventsService.getLatestEventForTopic({
      topic: token.sub,
      kind: API_EVENT_KINDS.user__accountActivationTokenGenerated__v1alpha1,
    });
    if (!event) {
      throw new BadRequestException(invalidOrExpiredActivationTokenMessage);
    }
    const exp = new Date(event?.data?.exp as number);
    if (
      new Date() < exp &&
      event?.topic === token.sub &&
      event?.data?.validationToken === token.validationToken
    ) {
      await this.apiEventsService.create({
        topic: event.topic,
        kind: API_EVENT_KINDS.user__accountActivationSucceeded__v1alpha1,
      });
      await this.userRepository.update({ id: event.topic }, { isActive: true });
      await this.apiEventsService.purgeAll({
        topic: event.topic,
        kind: API_EVENT_KINDS.user__accountActivationTokenGenerated__v1alpha1,
      });
      return true;
    }
    await this.apiEventsService.create({
      topic: event.topic,
      kind: API_EVENT_KINDS.user__accountActivationFailed__v1alpha1,
    });
    throw new BadRequestException(invalidOrExpiredActivationTokenMessage);
  }

  /**
   * Issue a signed JTW token, logging its issuance.
   */
  async login(user: User): Promise<AccessToken> {
    /**
     * Before actually issuing the token, we prepare the data we need to log the
     * soon-to-be-issued token: its expiration timestamp (calculated from the
     * validity interval configured), and -below- the id assigned to the log
     * entry of the token being issued.
     */
    const tokenExpiresIn: string = config.get('auth.jwt.expiresIn');
    // This should always be set (either via config or falling back to the
    // default provided to `AppConfig.get()`), but I don't know how to express
    // this without multiple dispatch, so we add this check to please the type
    // checker.
    if (!tokenExpiresIn) {
      throw new InternalServerErrorException(
        'Error while issuing JWT token: invalid `expiresIn` property value.',
      );
    }

    const tokenExpiresAt = Date.now() + ms(tokenExpiresIn);

    /**
     * Here we actually log the (imminent) issuance of the token.
     */
    const issuedTokenModel = new IssuedAuthnToken();
    issuedTokenModel.exp = new Date(tokenExpiresAt);
    issuedTokenModel.userId = user.id as string;
    // const issuedToken = await this.issuedAuthnTokensRepository.save(
    //   issuedTokenModel,
    // );

    /**
     * And finally we use the db-generated unique id of the token issuance log
     * record to compose the payload of the actual token. This `tokenId` is then
     * used in the JwtStrategy to check that the token being presented by an API
     * client was not revoked.
     */
    const payload: Partial<JwtDataPayload> = {
      sub: user.email,
      tokenId: v4(),
    };

    // await this.purgeExpiredIssuedTokens();

    return {
      user: UsersService.getSanitizedUserMetadata(user),
      accessToken: this.jwtService.sign(
        { ...payload },
        {
          expiresIn: config.get('auth.jwt.expiresIn'),
        },
      ),
    };
  }

  // /**
  //  * Find token by id in the log of issued tokens.
  //  *
  //  * See documentation of the IssuedAuthnToken entity for details on these ids.
  //  */
  // async findTokenById(tokenId: string): Promise<IssuedAuthnToken | undefined> {
  //   return this.issuedAuthnTokensRepository.findOne({ id: tokenId });
  // }

  // /**
  //  * Invalidate all JWT tokens for a given user.
  //  *
  //  * We basically delete all the tokens for the given user, which means the
  //  * authentication workflow will reject any otherwise valid JWT tokens
  //  * presented by an API client, even if their `exp` time is in the future.
  //  */
  // async invalidateAllTokensOfUser(userId: string): Promise<void> {
  //   await this.issuedAuthnTokensRepository.delete({ userId });
  // }

  /**
  //  * Purge all expired JWT tokens
  //  */
  // async purgeExpiredIssuedTokens(): Promise<void> {
  //   await this.issuedAuthnTokensRepository.delete({
  //     exp: LessThan(new Date()),
  //   });
  // }
}

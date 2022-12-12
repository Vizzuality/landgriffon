import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { User } from 'modules/users/user.entity';
import { UsersService } from 'modules/users/users.service';
import { compare, genSalt, hash } from 'bcrypt';
import { IssuedAuthnToken } from 'modules/authentication/issued-authn-token';
import { SignUpDto } from 'modules/authentication//dto/sign-up.dto';
import { ApiEventsService } from 'modules/api-events/api-events.service';
import { API_EVENT_KINDS } from 'modules/api-events/api-event.entity';
import { v4 } from 'uuid';
import * as ApiEventsUserData from 'modules/api-events/dto/apiEvents.user.data.dto';
import { UserRepository } from 'modules/users/user.repository';
import * as config from 'config';
import { ApiProperty } from '@nestjs/swagger';
import { ApiEventByTopicAndKind } from 'modules/api-events/api-event.topic+kind.entity';
import { Role } from 'modules/authorization/role.entity';
import { ROLES } from 'modules/authorization/roles/roles.enum';
import { CreateUserDTO } from 'modules/users/dto/create.user.dto';
import ms = require('ms');

/**
 * Access token for the app: key user data and access token
 */
export class AccessToken {
  /**
   * Whitelisted user metadata
   */
  @ApiProperty()
  user: Partial<User>;

  /**
   * Signed JWT
   */
  @ApiProperty()
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
    const user: User | null = await this.userRepository.findByEmail(email);
    const isUserActive: boolean = (user &&
      user.isActive &&
      !user.isDeleted) as boolean;

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
  async createUser(
    signupDto: CreateUserDTO | SignUpDto,
  ): Promise<Partial<User>> {
    const user: User = new User();
    user.displayName = signupDto.displayName;
    user.salt = await genSalt();
    user.password = await hash(signupDto.password, user.salt);
    user.email = signupDto.email;
    user.isActive = !config.get('auth.requireUserAccountActivation');
    if ('roles' in signupDto && signupDto.roles) {
      user.roles = Role.createRolesFromEnum(signupDto.roles);
    } else {
      const role: Role = new Role();
      role.name = ROLES.USER;
      user.roles = [role];
    }

    await this.checkEmail(user.email);
    const newUser: Omit<User, 'password' | 'salt' | 'isActive' | 'isDeleted'> =
      UsersService.getSanitizedUserMetadata(
        await this.userRepository.save(user),
      );
    if (!newUser) {
      throw new InternalServerErrorException('Error while creating a new user');
    }
    await this.apiEventsService.create({
      topic: newUser.id,
      kind: API_EVENT_KINDS.user__signedUp__v1alpha1,
    });
    const validationToken: string = v4();
    await this.apiEventsService.create({
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
    const invalidOrExpiredActivationTokenMessage: string =
      'Invalid or expired activation token.';
    const event: ApiEventByTopicAndKind | undefined =
      await this.apiEventsService.getLatestEventForTopic({
        topic: token.sub,
        kind: API_EVENT_KINDS.user__accountActivationTokenGenerated__v1alpha1,
      });
    if (!event) {
      throw new BadRequestException(invalidOrExpiredActivationTokenMessage);
    }
    const exp: Date = new Date(event?.data?.exp as number);
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

    const tokenExpiresAt: any = Date.now() + ms(tokenExpiresIn);

    /**
     * Here we actually log the (imminent) issuance of the token.
     */
    const issuedTokenModel: IssuedAuthnToken = new IssuedAuthnToken();
    issuedTokenModel.exp = new Date(tokenExpiresAt);
    issuedTokenModel.userId = user.id as string;

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

  private async checkEmail(email: string): Promise<void> {
    const user: User | null = await this.userRepository.findByEmail(email);
    if (user && !user.isDeleted) {
      throw new ConflictException('Email already exists.');
    }
  }
}

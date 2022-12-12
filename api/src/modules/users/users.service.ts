import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotImplementedException,
} from '@nestjs/common';
import { User, userResource } from 'modules/users/user.entity';

import { omit } from 'lodash';
import { CreateUserDTO } from 'modules/users/dto/create.user.dto';
import { UpdateUserDTO } from 'modules/users/dto/update.user.dto';
import { AppInfoDTO } from 'dto/info.dto';

import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import { UpdateUserPasswordDTO } from 'modules/users/dto/update.user-password';
import { compare, hash } from 'bcrypt';
import { AuthenticationService } from 'modules/authentication/authentication.service';
import { v4 } from 'uuid';
import { UserRepository } from 'modules/users/user.repository';

@Injectable()
export class UsersService extends AppBaseService<
  User,
  CreateUserDTO,
  UpdateUserDTO,
  AppInfoDTO
> {
  constructor(
    protected readonly repository: UserRepository,
    @Inject(forwardRef(() => AuthenticationService))
    private readonly authenticationService: AuthenticationService,
  ) {
    super(repository, userResource.name.singular, userResource.name.plural);
  }

  get serializerConfig(): JSONAPISerializerConfig<User> {
    return {
      attributes: [
        'fname',
        'lname',
        'email',
        'displayName',
        'avatarDataUrl',
        'isActive',
        'isDeleted',
        'roles',
      ],
      keyForAttribute: 'camelCase',
      projects: {
        ref: 'id',
        attributes: [
          'name',
          'description',
          'countryId',
          'adminAreaLevel1Id',
          'adminAreaLevel2Id',
          'planningUnitGridShape',
          'planningUnitAreakm2',
          'createdAt',
          'lastModifiedAt',
        ],
      },
      scenarios: {
        ref: 'id',
        attributes: [
          'name',
          'description',
          'type',
          'wdpaFilter',
          'wdpaThreshold',
          'adminRegionId',
          'numberOfRuns',
          'boundaryLengthModifier',
          'status',
          'createdAt',
          'lastModifiedAt',
        ],
      },
    };
  }

  /**
   * Assemble a sanitized user object from whitelisted properties of the User
   * entity.
   *
   * @debt Should be extended to include roles and permissions.
   */
  static getSanitizedUserMetadata(
    user: User,
  ): Omit<User, 'password' | 'salt' | 'isActive' | 'isDeleted'> {
    return omit(user, ['password', 'salt', 'isActive', 'isDeleted']);
  }

  /**
   * Mark user as deleted (and inactive).
   *
   * We don't currently delete users physically from the system when an account
   * deletion is requested, as this would mean needing to remove them from all
   * the objects (scenarios, etc) to which they are linked, which may not be the
   * desired default behaviour.
   *
   * When we soft-delete a user, we also set their account's email address to
   * a random one `@example.com`, so that a new account can be created later
   * on with the same email address.
   *
   * @debt We will need to implement hard-deletion later on, so that instance
   * administrators can enforce compliance with relevant data protection
   * regulations.
   */
  async markAsDeleted(userId: string): Promise<void> {
    await this.repository.update(
      { id: userId },
      {
        isDeleted: true,
        isActive: false,
        email: `deleted-account.${v4()}@example.com`,
      },
    );
  }

  /**
   * Update a user's own password.
   *
   * We require a guard here - the user should be able to prove they know their
   * current password. If they are not able to do so, they should go the 'reset
   * password' route (@debt, this will be implemented later).
   */
  async updateOwnPassword(
    userId: string,
    currentAndNewPasswords: UpdateUserPasswordDTO,
  ): Promise<void> {
    const user: User = await this.getById(userId);
    if (
      user &&
      (await compare(
        await hash(currentAndNewPasswords.currentPassword, user.salt),
        await hash(user.password, user.salt),
      ))
    ) {
      user.password = await hash(currentAndNewPasswords.newPassword, user.salt);
      await this.repository.save(user);
      return;
    }
    throw new ForbiddenException(
      'Updating the password is not allowed: the password provided for validation as current one does not match the actual current password. If you have forgotten your password, try resetting it instead.',
    );
  }

  /**
   * Validate that an update request can be fulfilled.
   *
   * - we enforce updating passwords via a separate route (`PATCH
   *   /api/v1/users/me/password`)
   * - @debt also we don't allow updating the user's email address at this stage
   *   (pending implementation of email verification)
   */
  async validateBeforeUpdate(
    id: string,
    updateModel: UpdateUserDTO,
  ): Promise<void> {
    if (updateModel.password) {
      throw new ForbiddenException(
        "The user's password cannot be updated alongside other user data: please use the API endpoint for password updates.",
      );
    }

    if (updateModel.email) {
      throw new NotImplementedException(
        "Updating a user's email address is not supported yet. This will be allowed once email address verification is implemented.",
      );
    }
  }

  async createUser(createUserDTO: CreateUserDTO): Promise<Partial<User>> {
    return this.authenticationService.createUser(createUserDTO);
  }
}

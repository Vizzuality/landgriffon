import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { User, userResource, UserResult } from 'modules/users/user.entity';
import { UsersService } from 'modules/users/users.service';

import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RequestWithAuthenticatedUser } from 'app.controller';
import { JSONAPIQueryParams } from 'decorators/json-api-parameters.decorator';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';
import {
  UpdateOwnUserDTO,
  UpdateUserDTO,
} from 'modules/users/dto/update.user.dto';
import { UpdateUserPasswordDTO } from 'modules/users/dto/update.user-password';
import { PaginationMeta } from 'utils/app-base.service';
import { CreateUserDTO } from 'modules/users/dto/create.user.dto';
import { RolesGuard } from 'guards/roles.guard';
import { ROLES } from 'modules/authorization/roles/roles.enum';
import { RequiredRoles } from 'decorators/roles.decorator';
import { DeleteResult } from 'typeorm';
import { AccessControl } from 'modules/authorization/access-control.service';
import { RecoverPasswordDto } from 'modules/authentication/dto/recover-password.dto';
import { Public } from 'decorators/public.decorator';
import { ResetPasswordDto } from 'modules/authentication/dto/reset-password.dto';
import { GetUser } from 'decorators/get-user.decorator';
import { ScenariosService } from 'modules/scenarios/scenarios.service';

@ApiTags(userResource.className)
@Controller(`/api/v1/users`)
@ApiBearerAuth()
@UseGuards(RolesGuard)
export class UsersController {
  constructor(
    public readonly service: UsersService,
    private readonly scenarioService: ScenariosService,
    private readonly accessControl: AccessControl,
  ) {}

  @ApiOperation({
    description: 'Find all users',
  })
  @ApiOkResponse({
    type: User,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized.',
  })
  @ApiForbiddenResponse({
    description:
      'The current user does not have suitable permissions for this request.',
  })
  @JSONAPIQueryParams({
    entitiesAllowedAsIncludes: userResource.entitiesAllowedAsIncludes,
  })
  @RequiredRoles(ROLES.ADMIN)
  @Get()
  async findAll(
    @ProcessFetchSpecification({
      allowedFilters: userResource.columnsAllowedAsFilter,
    })
    fetchSpecification: FetchSpecification,
  ): Promise<User[]> {
    const results: {
      data: (Partial<User> | undefined)[];
      metadata: PaginationMeta | undefined;
    } = await this.service.findAllPaginated({
      ...fetchSpecification,
      include: ['roles', 'roles.permissions'],
    });
    return this.service.serialize(results.data, results.metadata);
  }

  @ApiOperation({ description: 'Create new user' })
  @ApiCreatedResponse({ description: 'User created successfully' })
  @ApiOkResponse({
    type: User,
  })
  @RequiredRoles(ROLES.ADMIN)
  @Post()
  async createUser(
    @Body(new ValidationPipe()) createUserDTO: CreateUserDTO,
  ): Promise<User> {
    return this.service.serialize(await this.service.createUser(createUserDTO));
  }

  @ApiOperation({
    description:
      'Update the password of a user, if they can present the current one.',
  })
  @ApiOkResponse({ type: UserResult })
  @Patch('me/password')
  async updateOwnPassword(
    @Body(new ValidationPipe()) dto: UpdateUserPasswordDTO,
    @Request() req: RequestWithAuthenticatedUser,
  ): Promise<void> {
    return await this.service.updateOwnPassword(req.user.id, dto);
  }

  @ApiOperation({ description: 'Update own user.' })
  @ApiOkResponse({ type: UserResult })
  @Patch('me')
  async update(
    @Body(new ValidationPipe({ forbidNonWhitelisted: true }))
    dto: UpdateOwnUserDTO,
    @Request() req: RequestWithAuthenticatedUser,
  ): Promise<UserResult> {
    if (!this.accessControl.isUserAdmin() && dto.email) {
      throw new BadRequestException(
        'Only Admin users can update email address',
      );
    }
    return this.service.serialize(
      await this.service.update(req.user.id, dto, {
        authenticatedUser: req.user,
      }),
    );
  }

  @ApiOperation({
    description: 'Recover password presenting a valid user email',
  })
  @ApiOkResponse()
  @Public()
  @Post('/me/password/recover')
  async recoverPassword(
    @Body(ValidationPipe) recoverPasswordDto: RecoverPasswordDto,
  ): Promise<{ message: string }> {
    await this.service.recoverPassword(recoverPasswordDto.email);

    return {
      message: `Recovery email sent to user with email: ${recoverPasswordDto.email}`,
    };
  }

  @ApiOperation({
    description: 'Reset a user password presenting a valid token',
  })
  @ApiOkResponse()
  @Post('/me/password/reset')
  async resetPassword(
    @Headers('authorization') token: string,
    @Body(ValidationPipe) resetPasswordDto: ResetPasswordDto,
    @GetUser() user: User,
  ): Promise<UserResult> {
    /**
     * @note: Token validation (expiration, user bound to it) is handled by Jwt Guard
     */
    return this.service.serialize(
      await this.service.resetPassword(user, resetPasswordDto.password),
    );
  }

  @ApiOperation({
    description: 'Retrieve attributes of the current user',
  })
  @ApiResponse({
    type: UserResult,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized.',
  })
  @ApiForbiddenResponse({
    description:
      'The current user does not have suitable permissions for this request.',
  })
  @Get('me')
  async userMetadata(
    @Request() req: RequestWithAuthenticatedUser,
  ): Promise<UserResult> {
    if (!req?.user?.id) {
      throw new UnauthorizedException();
    }
    const user: User = await this.service.getById(req.user.id, {
      include: ['roles', 'roles.permissions'],
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.service.serialize(user);
  }

  @ApiOperation({
    description: 'Mark user as deleted.',
  })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Delete('me')
  async deleteOwnUser(
    @Request() req: RequestWithAuthenticatedUser,
  ): Promise<void> {
    return this.service.markAsDeleted(req.user.id);
  }

  @ApiOperation({ description: 'Update a user as admin' })
  @ApiCreatedResponse({ description: 'User created successfully' })
  @ApiOkResponse({
    type: User,
  })
  @ApiForbiddenResponse()
  @RequiredRoles(ROLES.ADMIN)
  @Patch(':id')
  async updateUser(
    @Body(new ValidationPipe()) updateUser: UpdateUserDTO,
    @Param('id') userId: string,
  ): Promise<User> {
    return this.service.serialize(
      await this.service.updateUser(userId, updateUser),
    );
  }

  @ApiOperation({
    description:
      'Delete a user. This operation will destroy any resource related to the user and it will be irreversible',
  })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @RequiredRoles(ROLES.ADMIN)
  @Delete(':userId')
  async deleteUser(
    @Param('userId') userIdToDelete: string,
  ): Promise<DeleteResult> {
    const requestingUserId: string = this.accessControl.getUserId();
    await this.scenarioService.updatePublicScenarioOwnership(
      userIdToDelete,
      requestingUserId,
    );
    return this.service.deleteUser(userIdToDelete);
  }
}

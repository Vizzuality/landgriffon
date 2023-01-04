import {
  Body,
  Controller,
  Delete,
  Get,
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
import { UpdateUserDTO } from 'modules/users/dto/update.user.dto';
import { UpdateUserPasswordDTO } from 'modules/users/dto/update.user-password';
import { PaginationMeta } from 'utils/app-base.service';
import { CreateUserDTO } from 'modules/users/dto/create.user.dto';
import { RolesGuard } from 'guards/roles.guard';
import { ROLES } from 'modules/authorization/roles/roles.enum';
import { RequiredRoles } from 'decorators/roles.decorator';

@ApiTags(userResource.className)
@Controller(`/api/v1/users`)
@ApiBearerAuth()
@UseGuards(RolesGuard)
export class UsersController {
  constructor(public readonly service: UsersService) {}

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
    } = await this.service.findAllPaginated(fetchSpecification);
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

  @ApiOperation({ description: 'Update a user.' })
  @ApiOkResponse({ type: UserResult })
  @Patch('me')
  async update(
    @Body(new ValidationPipe({ forbidNonWhitelisted: true }))
    dto: UpdateUserDTO,
    @Request() req: RequestWithAuthenticatedUser,
  ): Promise<UserResult> {
    return this.service.serialize(
      await this.service.update(req.user.id, dto, {
        authenticatedUser: req.user,
      }),
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
      include: ['roles'],
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
}

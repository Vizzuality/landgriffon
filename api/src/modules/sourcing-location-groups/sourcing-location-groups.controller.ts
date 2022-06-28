import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SourcingLocationGroupsService } from 'modules/sourcing-location-groups/sourcing-location-groups.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  JSONAPIQueryParams,
  JSONAPISingleEntityQueryParams,
} from 'decorators/json-api-parameters.decorator';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';
import {
  SourcingLocationGroup,
  sourcingLocationGroupResource,
} from 'modules/sourcing-location-groups/sourcing-location-group.entity';
import { CreateSourcingLocationGroupDto } from 'modules/sourcing-location-groups/dto/create.sourcing-location-group.dto';
import { UpdateSourcingLocationGroupDto } from 'modules/sourcing-location-groups/dto/update.sourcing-location-group.dto';
import { PaginationMeta } from 'utils/app-base.service';
import { SetUserInterceptor } from 'decorators/set-user.interceptor';

@Controller(`/api/v1/sourcing-location-groups`)
@ApiTags(sourcingLocationGroupResource.className)
@ApiBearerAuth()
export class SourcingLocationGroupsController {
  constructor(
    public readonly sourcingLocationsService: SourcingLocationGroupsService,
  ) {}

  @ApiOperation({
    description: 'Find all sourcing location groups',
  })
  @ApiOkResponse({
    type: SourcingLocationGroup,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams({
    availableFilters: sourcingLocationGroupResource.columnsAllowedAsFilter.map(
      (columnName: string) => ({
        name: columnName,
      }),
    ),
  })
  @Get()
  async findAll(
    @ProcessFetchSpecification({
      allowedFilters: sourcingLocationGroupResource.columnsAllowedAsFilter,
    })
    fetchSpecification: FetchSpecification,
  ): Promise<SourcingLocationGroup> {
    const results: {
      data: (Partial<SourcingLocationGroup> | undefined)[];
      metadata: PaginationMeta | undefined;
    } = await this.sourcingLocationsService.findAllPaginated(
      fetchSpecification,
    );
    return this.sourcingLocationsService.serialize(
      results.data,
      results.metadata,
    );
  }

  @ApiOperation({ description: 'Find sourcing location group by id' })
  @ApiOkResponse({ type: SourcingLocationGroup })
  @ApiNotFoundResponse({ description: 'Sourcing location group not found' })
  @JSONAPISingleEntityQueryParams()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SourcingLocationGroup> {
    return await this.sourcingLocationsService.serialize(
      await this.sourcingLocationsService.getById(id),
    );
  }

  @ApiOperation({ description: 'Create a sourcing location group' })
  @ApiOkResponse({ type: SourcingLocationGroup })
  @ApiBadRequestResponse({
    description: 'Bad Request. Incorrect or missing parameters',
  })
  @Post()
  @UsePipes(ValidationPipe)
  async create(
    @Body() dto: CreateSourcingLocationGroupDto,
  ): Promise<SourcingLocationGroup> {
    return await this.sourcingLocationsService.serialize(
      await this.sourcingLocationsService.create(dto),
    );
  }

  @ApiOperation({ description: 'Updates a sourcing location group' })
  @ApiOkResponse({ type: SourcingLocationGroup })
  @ApiNotFoundResponse({ description: 'Sourcing location group not found' })
  @UseInterceptors(SetUserInterceptor)
  @Patch(':id')
  async update(
    @Body(new ValidationPipe()) dto: UpdateSourcingLocationGroupDto,
    @Param('id') id: string,
  ): Promise<SourcingLocationGroup> {
    return await this.sourcingLocationsService.serialize(
      await this.sourcingLocationsService.update(id, dto),
    );
  }

  @ApiOperation({ description: 'Deletes a sourcing location group' })
  @ApiOkResponse()
  @ApiNotFoundResponse({ description: 'Sourcing location group not found' })
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.sourcingLocationsService.remove(id);
  }
}

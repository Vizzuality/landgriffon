import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SourcingLocationGroupsService } from 'modules/sourcing-location-groups/sourcing-location-groups.service';
import {
  ApiForbiddenResponse,
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
  sourcingRecordGroupResource,
} from 'modules/sourcing-location-groups/sourcing-location-group.entity';
import { CreateSourcingLocationGroupDto } from 'modules/sourcing-location-groups/dto/create.sourcing-location-group.dto';
import { UpdateSourcingLocationGroupDto } from 'modules/sourcing-location-groups/dto/update.sourcing-location-group.dto';

@Controller(`/api/v1/sourcing-location-groups`)
@ApiTags(sourcingRecordGroupResource.className)
export class SourcingLocationGroupsController {
  constructor(
    public readonly sourcingRecordsService: SourcingLocationGroupsService,
  ) {}

  @ApiOperation({
    description: 'Find all sourcing record groups',
  })
  @ApiOkResponse({
    type: SourcingLocationGroup,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams({
    availableFilters: sourcingRecordGroupResource.columnsAllowedAsFilter.map(
      (columnName: string) => ({
        name: columnName,
      }),
    ),
  })
  @Get()
  async findAll(
    @ProcessFetchSpecification({
      allowedFilters: sourcingRecordGroupResource.columnsAllowedAsFilter,
    })
    fetchSpecification: FetchSpecification,
  ): Promise<SourcingLocationGroup> {
    const results = await this.sourcingRecordsService.findAllPaginated(
      fetchSpecification,
    );
    return this.sourcingRecordsService.serialize(
      results.data,
      results.metadata,
    );
  }

  @ApiOperation({ description: 'Find sourcing record group by id' })
  @ApiOkResponse({ type: SourcingLocationGroup })
  @JSONAPISingleEntityQueryParams()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SourcingLocationGroup> {
    return await this.sourcingRecordsService.serialize(
      await this.sourcingRecordsService.getById(id),
    );
  }

  @ApiOperation({ description: 'Create a sourcing record group' })
  @ApiOkResponse({ type: SourcingLocationGroup })
  @Post()
  @UsePipes(ValidationPipe)
  async create(
    @Body() dto: CreateSourcingLocationGroupDto,
  ): Promise<SourcingLocationGroup> {
    return await this.sourcingRecordsService.serialize(
      await this.sourcingRecordsService.create(dto),
    );
  }

  @ApiOperation({ description: 'Updates a sourcing record group' })
  @ApiOkResponse({ type: SourcingLocationGroup })
  @Patch(':id')
  async update(
    @Body(new ValidationPipe()) dto: UpdateSourcingLocationGroupDto,
    @Param('id') id: string,
  ): Promise<SourcingLocationGroup> {
    return await this.sourcingRecordsService.serialize(
      await this.sourcingRecordsService.update(id, dto),
    );
  }

  @ApiOperation({ description: 'Deletes a sourcing record group' })
  @ApiOkResponse()
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.sourcingRecordsService.remove(id);
  }
}

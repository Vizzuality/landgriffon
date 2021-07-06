import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { SourcingRecordGroupsService } from 'modules/sourcing-record-groups/sourcing-record-groups.service';
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
  SourcingRecordGroup,
  sourcingRecordGroupResource,
} from 'modules/sourcing-record-groups/sourcing-record-group.entity';
import { CreateSourcingRecordGroupDto } from 'modules/sourcing-record-groups/dto/create.sourcing-record-group.dto';
import { UpdateSourcingRecordGroupDto } from 'modules/sourcing-record-groups/dto/update.sourcing-record-group.dto';

@Controller(`/api/v1/sourcing-record-groups`)
@ApiTags(sourcingRecordGroupResource.className)
export class SourcingRecordGroupsController {
  constructor(
    public readonly sourcingRecordsService: SourcingRecordGroupsService,
  ) {}

  @ApiOperation({
    description: 'Find all sourcing record groups',
  })
  @ApiOkResponse({
    type: SourcingRecordGroup,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams()
  @Get()
  async findAll(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<SourcingRecordGroup> {
    const results = await this.sourcingRecordsService.findAllPaginated(
      fetchSpecification,
    );
    return this.sourcingRecordsService.serialize(
      results.data,
      results.metadata,
    );
  }

  @ApiOperation({ description: 'Find sourcing record group by id' })
  @ApiOkResponse({ type: SourcingRecordGroup })
  @JSONAPISingleEntityQueryParams()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SourcingRecordGroup> {
    return await this.sourcingRecordsService.serialize(
      await this.sourcingRecordsService.getById(id),
    );
  }

  @ApiOperation({ description: 'Create a sourcing record group' })
  @ApiOkResponse({ type: SourcingRecordGroup })
  @Post()
  async create(
    @Body() dto: CreateSourcingRecordGroupDto,
  ): Promise<SourcingRecordGroup> {
    return await this.sourcingRecordsService.serialize(
      await this.sourcingRecordsService.create(dto),
    );
  }

  @ApiOperation({ description: 'Updates a sourcing record group' })
  @ApiOkResponse({ type: SourcingRecordGroup })
  @Patch(':id')
  async update(
    @Body(new ValidationPipe()) dto: UpdateSourcingRecordGroupDto,
    @Param('id') id: string,
  ): Promise<SourcingRecordGroup> {
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

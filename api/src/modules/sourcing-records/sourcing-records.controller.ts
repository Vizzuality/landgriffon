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
import { SourcingRecordsService } from 'modules/sourcing-records/sourcing-records.service';
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
  SourcingRecord,
  sourcingRecordResource,
} from 'modules/sourcing-records/sourcing-record.entity';
import { CreateSourcingRecordDto } from 'modules/sourcing-records/dto/create.sourcing-record.dto';
import { UpdateSourcingRecordDto } from 'modules/sourcing-records/dto/update.sourcing-record.dto';

@Controller(`/api/v1/sourcing-records`)
@ApiTags(sourcingRecordResource.className)
export class SourcingRecordsController {
  constructor(public readonly sourcingRecordsService: SourcingRecordsService) {}

  @ApiOperation({
    description: 'Find all business units',
  })
  @ApiOkResponse({
    type: SourcingRecord,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams()
  @Get()
  async findAll(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<SourcingRecord> {
    const results = await this.sourcingRecordsService.findAllPaginated(
      fetchSpecification,
    );
    return this.sourcingRecordsService.serialize(
      results.data,
      results.metadata,
    );
  }

  @ApiOperation({ description: 'Find business unit by id' })
  @ApiOkResponse({ type: SourcingRecord })
  @JSONAPISingleEntityQueryParams()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SourcingRecord> {
    return await this.sourcingRecordsService.serialize(
      await this.sourcingRecordsService.getById(id),
    );
  }

  @ApiOperation({ description: 'Create a business unit' })
  @ApiOkResponse({ type: SourcingRecord })
  @Post()
  async create(@Body() dto: CreateSourcingRecordDto): Promise<SourcingRecord> {
    return await this.sourcingRecordsService.serialize(
      await this.sourcingRecordsService.create(dto),
    );
  }

  @ApiOperation({ description: 'Updates a business unit' })
  @ApiOkResponse({ type: SourcingRecord })
  @Patch(':id')
  async update(
    @Body(new ValidationPipe()) dto: UpdateSourcingRecordDto,
    @Param('id') id: string,
  ): Promise<SourcingRecord> {
    return await this.sourcingRecordsService.serialize(
      await this.sourcingRecordsService.update(id, dto),
    );
  }

  @ApiOperation({ description: 'Deletes a business unit' })
  @ApiOkResponse()
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.sourcingRecordsService.remove(id);
  }
}

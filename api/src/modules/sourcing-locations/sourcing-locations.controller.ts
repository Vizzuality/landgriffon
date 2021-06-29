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
import { SourcingLocationsService } from 'modules/sourcing-locations/sourcing-locations.service';
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
  SourcingLocation,
  sourcingLocationResource,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { CreateSourcingLocationDto } from 'modules/sourcing-locations/dto/create.sourcing-location.dto';
import { UpdateSourcingLocationDto } from 'modules/sourcing-locations/dto/update.sourcing-location.dto';

@Controller(`/api/v1/sourcing-locations`)
@ApiTags(sourcingLocationResource.className)
export class SourcingLocationsController {
  constructor(
    public readonly sourcingLocationsService: SourcingLocationsService,
  ) {}

  @ApiOperation({
    description: 'Find all sourcing locations',
  })
  @ApiOkResponse({
    type: SourcingLocation,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams()
  @Get()
  async findAll(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<SourcingLocation> {
    const results = await this.sourcingLocationsService.findAllPaginated(
      fetchSpecification,
    );
    return this.sourcingLocationsService.serialize(
      results.data,
      results.metadata,
    );
  }

  @ApiOperation({ description: 'Find sourcing location by id' })
  @ApiOkResponse({ type: SourcingLocation })
  @JSONAPISingleEntityQueryParams()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SourcingLocation> {
    return await this.sourcingLocationsService.serialize(
      await this.sourcingLocationsService.getById(id),
    );
  }

  @ApiOperation({ description: 'Create a sourcing location' })
  @ApiOkResponse({ type: SourcingLocation })
  @Post()
  async create(
    @Body() dto: CreateSourcingLocationDto,
  ): Promise<SourcingLocation> {
    return await this.sourcingLocationsService.serialize(
      await this.sourcingLocationsService.create(dto),
    );
  }

  @ApiOperation({ description: 'Updates a sourcing location' })
  @ApiOkResponse({ type: SourcingLocation })
  @Patch(':id')
  async update(
    @Body(new ValidationPipe()) dto: UpdateSourcingLocationDto,
    @Param('id') id: string,
  ): Promise<SourcingLocation> {
    return await this.sourcingLocationsService.serialize(
      await this.sourcingLocationsService.update(id, dto),
    );
  }

  @ApiOperation({ description: 'Deletes a sourcing location' })
  @ApiOkResponse()
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.sourcingLocationsService.remove(id);
  }
}

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
import { SourcingLocationsService } from 'modules/sourcing-locations/sourcing-locations.service';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  JSONAPIQueryParams,
  JSONAPIQueryParamsOnlyPagination,
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
import { PaginationMeta } from 'utils/app-base.service';
import { ImportedMaterialsListResponseDto } from 'modules/sourcing-locations/dto/imported-materials.sourcing-location.dto';
import { MaterialsFromSourcingLocationsService } from './materials-from-sourcing-locations.service';

@Controller(`/api/v1/sourcing-locations`)
@ApiTags(sourcingLocationResource.className)
export class SourcingLocationsController {
  constructor(
    public readonly sourcingLocationsService: SourcingLocationsService,
    public readonly materialsFromSourcingLocationsService: MaterialsFromSourcingLocationsService,
  ) {}

  @ApiOperation({
    description: 'Find all sourcing locations',
  })
  @ApiOkResponse({
    type: SourcingLocation,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams({
    availableFilters: sourcingLocationResource.columnsAllowedAsFilter.map(
      (columnName: string) => ({
        name: columnName,
      }),
    ),
    entitiesAllowedAsIncludes:
      sourcingLocationResource.entitiesAllowedAsIncludes,
  })
  @Get()
  async findAll(
    @ProcessFetchSpecification({
      allowedFilters: sourcingLocationResource.columnsAllowedAsFilter,
    })
    fetchSpecification: FetchSpecification,
  ): Promise<SourcingLocation> {
    const results: {
      data: (Partial<SourcingLocation> | undefined)[];
      metadata: PaginationMeta | undefined;
    } = await this.sourcingLocationsService.findAllPaginated(
      fetchSpecification,
    );
    return this.sourcingLocationsService.serialize(
      results.data,
      results.metadata,
    );
  }

  @ApiOperation({
    description:
      'Get detailed list of materials imported by user and  existing in sourcing records',
  })
  @JSONAPIQueryParamsOnlyPagination()
  @ApiOkResponse({ type: ImportedMaterialsListResponseDto })
  @Get('/materials-list')
  async materialList(
    @ProcessFetchSpecification()
    fetchSpecification: FetchSpecification,
  ): Promise<Partial<SourcingLocation>[]> {
    const materials: {
      data: (Partial<SourcingLocation> | undefined)[];
      metadata: PaginationMeta | undefined;
    } = await this.materialsFromSourcingLocationsService.getMaterialsFromSourcingLocations(
      fetchSpecification,
    );

    return this.materialsFromSourcingLocationsService.serialize(
      materials.data,
      materials.metadata,
    );
  }

  @ApiOperation({ description: 'Find sourcing location by id' })
  @ApiOkResponse({ type: SourcingLocation })
  @ApiNotFoundResponse({ description: 'Sourcing location not found' })
  @JSONAPISingleEntityQueryParams()
  @Get(':id')
  async findOne(
    @ProcessFetchSpecification({
      allowedFilters: sourcingLocationResource.columnsAllowedAsFilter,
    })
    fetchSpecification: FetchSpecification,
    @Param('id') id: string,
  ): Promise<SourcingLocation> {
    return await this.sourcingLocationsService.serialize(
      await this.sourcingLocationsService.getById(id, fetchSpecification),
    );
  }

  @ApiOperation({ description: 'Create a sourcing location' })
  @ApiOkResponse({ type: SourcingLocation })
  @ApiBadRequestResponse({
    description: 'Bad Request. Incorrect or missing parameters',
  })
  @Post()
  @UsePipes(new ValidationPipe())
  async create(
    @Body() dto: CreateSourcingLocationDto,
  ): Promise<SourcingLocation> {
    return await this.sourcingLocationsService.serialize(
      await this.sourcingLocationsService.create(dto),
    );
  }

  @ApiOperation({ description: 'Updates a sourcing location' })
  @ApiOkResponse({ type: SourcingLocation })
  @ApiNotFoundResponse({ description: 'Sourcing location not found' })
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
  @ApiNotFoundResponse({ description: 'Sourcing location not found' })
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.sourcingLocationsService.remove(id);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
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
  JSONAPIPaginationQueryParams,
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
import { PaginationMeta } from 'utils/app-base.service';
import { SourcingLocationsMaterialsResponseDto } from 'modules/sourcing-locations/dto/materials.sourcing-location.dto';
import { GetSourcingMaterialsQueryDto } from 'modules/sourcing-locations/dto/materials-query.sourcing-location.dto';
import { SourcingLocationsMaterialsService } from 'modules/sourcing-locations/sourcing-locations-materials.service';
import { SetUserInterceptor } from 'decorators/set-user.interceptor';
import { LocationTypesDto } from 'modules/sourcing-locations/dto/location-type.sourcing-locations.dto';
import { LocationTypesOptionsDto } from './dto/location-types-options.sourcing-locations.dto';

@Controller(`/api/v1/sourcing-locations`)
@ApiTags(sourcingLocationResource.className)
export class SourcingLocationsController {
  constructor(
    public readonly sourcingLocationsService: SourcingLocationsService,
    public readonly sourcingLocationsMaterialsService: SourcingLocationsMaterialsService,
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
    description: 'Find all Materials with details for Sourcing Locations',
  })
  @ApiOkResponse({
    type: SourcingLocationsMaterialsResponseDto,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIPaginationQueryParams()
  @Get('/materials')
  async findAllMaterials(
    @ProcessFetchSpecification()
    fetchSpecification: FetchSpecification,

    @Query(ValidationPipe) queryParams: GetSourcingMaterialsQueryDto,
  ): Promise<SourcingLocationsMaterialsResponseDto> {
    const results: {
      data: (Partial<SourcingLocation> | undefined)[];
      metadata: PaginationMeta | undefined;
    } = await this.sourcingLocationsMaterialsService.findAllPaginated(
      fetchSpecification,
    );
    return this.sourcingLocationsMaterialsService.serialize(
      results.data,
      results.metadata,
    );
  }

  @ApiOperation({ description: 'Gets available location types' })
  @ApiOkResponse({ type: LocationTypesDto })
  @Get('/location-types')
  async getLocationTypes(
    @Query(ValidationPipe) locationTypesOptions: LocationTypesOptionsDto,
  ): Promise<LocationTypesDto> {
    return this.sourcingLocationsService.getLocationTypes(locationTypesOptions);
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
  @UseInterceptors(SetUserInterceptor)
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

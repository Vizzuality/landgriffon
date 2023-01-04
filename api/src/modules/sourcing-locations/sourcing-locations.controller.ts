import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SourcingLocationsService } from 'modules/sourcing-locations/sourcing-locations.service';
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
import { GetLocationTypesDto } from 'modules/sourcing-locations/dto/location-types-options.sourcing-locations.dto';
import { RolesGuard } from 'guards/roles.guard';
import { RequiredRoles } from 'decorators/roles.decorator';
import { ROLES } from 'modules/authorization/roles/roles.enum';

@Controller(`/api/v1/sourcing-locations`)
@ApiTags(sourcingLocationResource.className)
@ApiBearerAuth()
@UseGuards(RolesGuard)
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
    @Query(ValidationPipe) locationTypesOptions: GetLocationTypesDto,
  ): Promise<LocationTypesDto> {
    return this.sourcingLocationsService.getLocationTypes(locationTypesOptions);
  }

  @ApiOperation({ description: 'Get location types supported by the platform' })
  @ApiOkResponse({ type: LocationTypesDto })
  @Get('/location-types/supported')
  async getAllSupportedLocationTypes(): Promise<LocationTypesDto> {
    return this.sourcingLocationsService.getAllSupportedLocationTypes();
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
  @RequiredRoles(ROLES.ADMIN)
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
  @RequiredRoles(ROLES.ADMIN)
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
  @RequiredRoles(ROLES.ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.sourcingLocationsService.remove(id);
  }
}

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
import { GeoRegionsService } from 'modules/geo-regions/geo-regions.service';
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
  GeoRegion,
  geoRegionResource,
} from 'modules/geo-regions/geo-region.entity';
import { CreateGeoRegionDto } from 'modules/geo-regions/dto/create.geo-region.dto';
import { UpdateGeoRegionDto } from 'modules/geo-regions/dto/update.geo-region.dto';
import { PaginationMeta } from 'utils/app-base.service';

@Controller(`/api/v1/geo-regions`)
@ApiTags(geoRegionResource.className)
export class GeoRegionsController {
  constructor(public readonly geoRegionsService: GeoRegionsService) {}

  @ApiOperation({
    description: 'Find all geo regions',
  })
  @ApiOkResponse({
    type: GeoRegion,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams({
    availableFilters: geoRegionResource.columnsAllowedAsFilter.map(
      (columnName: string) => ({
        name: columnName,
      }),
    ),
  })
  @Get()
  async findAll(
    @ProcessFetchSpecification({
      allowedFilters: geoRegionResource.columnsAllowedAsFilter,
    })
    fetchSpecification: FetchSpecification,
  ): Promise<GeoRegion> {
    const results: {
      data: (Partial<GeoRegion> | undefined)[];
      metadata: PaginationMeta | undefined;
    } = await this.geoRegionsService.findAllPaginated(fetchSpecification);
    return this.geoRegionsService.serialize(results.data, results.metadata);
  }

  @ApiOperation({ description: 'Find geo region by id' })
  @ApiOkResponse({ type: GeoRegion })
  @JSONAPISingleEntityQueryParams()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<GeoRegion> {
    return await this.geoRegionsService.serialize(
      await this.geoRegionsService.getById(id),
    );
  }

  @ApiOperation({ description: 'Create a geo region' })
  @ApiOkResponse({ type: GeoRegion })
  @Post()
  @UsePipes(ValidationPipe)
  async create(@Body() dto: CreateGeoRegionDto): Promise<GeoRegion> {
    return await this.geoRegionsService.serialize(
      await this.geoRegionsService.create(dto),
    );
  }

  @ApiOperation({ description: 'Updates a geo region' })
  @ApiOkResponse({ type: GeoRegion })
  @Patch(':id')
  async update(
    @Body(new ValidationPipe()) dto: UpdateGeoRegionDto,
    @Param('id') id: string,
  ): Promise<GeoRegion> {
    return await this.geoRegionsService.serialize(
      await this.geoRegionsService.update(id, dto),
    );
  }

  @ApiOperation({ description: 'Deletes a geo region' })
  @ApiOkResponse()
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.geoRegionsService.remove(id);
  }
}

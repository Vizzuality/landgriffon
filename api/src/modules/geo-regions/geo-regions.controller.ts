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

@Controller(`/api/v1/geo-regions`)
@ApiTags(geoRegionResource.className)
export class GeoRegionsController {
  constructor(public readonly service: GeoRegionsService) {}

  @ApiOperation({
    description: 'Find all geo regions',
  })
  @ApiOkResponse({
    type: GeoRegion,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams()
  @Get()
  async findAll(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<GeoRegion> {
    const results = await this.service.findAllPaginated(fetchSpecification);
    return this.service.serialize(results.data, results.metadata);
  }

  @ApiOperation({ description: 'Find geo region by id' })
  @ApiOkResponse({ type: GeoRegion })
  @JSONAPISingleEntityQueryParams()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<GeoRegion> {
    return await this.service.serialize(await this.service.getById(id));
  }

  @ApiOperation({ description: 'Create a geo region' })
  @ApiOkResponse({ type: GeoRegion })
  @Post()
  async create(@Body() dto: CreateGeoRegionDto): Promise<GeoRegion> {
    return await this.service.serialize(await this.service.create(dto));
  }

  @ApiOperation({ description: 'Updates a geo region' })
  @ApiOkResponse({ type: GeoRegion })
  @Patch(':id')
  async update(
    @Body(new ValidationPipe()) dto: UpdateGeoRegionDto,
    @Param('id') id: string,
  ): Promise<GeoRegion> {
    return await this.service.serialize(await this.service.update(id, dto));
  }

  @ApiOperation({ description: 'Deletes a geo region' })
  @ApiOkResponse()
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.service.remove(id);
  }
}

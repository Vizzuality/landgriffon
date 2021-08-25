import { Controller, Get, Param, Query, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { H3DataService } from 'modules/h3-data/h3-data.service';
import { H3Data, H3IndexValueData } from 'modules/h3-data/h3-data.entity';
import {
  DEFAULT_RESOLUTION,
  H3ByResolutionDto,
} from 'modules/h3-data/dto/h3-by-resolution.dto';

@Controller('api/v1/h3')
@ApiTags(H3Data.name)
export class H3DataController {
  constructor(protected readonly h3DataService: H3DataService) {}

  @ApiOperation({ description: 'Retrieve H3 data providing its name' })
  @Get('data/:h3TableName/:h3ColumnName')
  async findOneByName(
    @Param('h3TableName') h3TableName: string,
    @Param('h3ColumnName') h3ColumnName: string,
  ): Promise<{ data: H3IndexValueData }> {
    const h3Data = await this.h3DataService.findH3ByName(
      h3TableName,
      h3ColumnName,
    );
    return { data: h3Data };
  }

  @ApiOperation({ description: 'Get h3 indexes by ID in a given resolution' })
  @ApiQuery({
    description:
      'If no resolution provided, value will equal to max resolution: 6',
  })
  @Get('data/:h3Id')
  async geth3ByIdAndResolution(
    @Param('h3Id') h3Id: string,
    @Query(ValidationPipe)
    queryParams: H3ByResolutionDto,
  ): Promise<any> {
    let { resolution } = queryParams;
    if (!resolution) resolution = DEFAULT_RESOLUTION;
    return await this.h3DataService.getH3ByIdAndResolution(h3Id, resolution);
  }
}

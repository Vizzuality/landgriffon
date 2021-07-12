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
import { IndicatorSourcesService } from 'modules/indicator-sources/indicator-sources.service';
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
  IndicatorSource,
  indicatorSourceResource,
} from 'modules/indicator-sources/indicator-source.entity';
import { CreateIndicatorSourceDto } from 'modules/indicator-sources/dto/create.indicator-source.dto';
import { UpdateIndicatorSourceDto } from 'modules/indicator-sources/dto/update.indicator-source.dto';

@Controller(`/api/v1/indicator-sources`)
@ApiTags(indicatorSourceResource.className)
export class IndicatorSourcesController {
  constructor(
    public readonly indicatorSourcesService: IndicatorSourcesService,
  ) {}

  @ApiOperation({
    description: 'Find all indicator sources',
  })
  @ApiOkResponse({
    type: IndicatorSource,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams()
  @Get()
  async findAll(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<IndicatorSource> {
    const results = await this.indicatorSourcesService.findAllPaginated(
      fetchSpecification,
    );
    return this.indicatorSourcesService.serialize(
      results.data,
      results.metadata,
    );
  }

  @ApiOperation({ description: 'Find indicator source by id' })
  @ApiOkResponse({ type: IndicatorSource })
  @JSONAPISingleEntityQueryParams()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IndicatorSource> {
    return await this.indicatorSourcesService.serialize(
      await this.indicatorSourcesService.getById(id),
    );
  }

  @ApiOperation({ description: 'Create a indicator source' })
  @ApiOkResponse({ type: IndicatorSource })
  @Post()
  @UsePipes(ValidationPipe)
  async create(
    @Body() dto: CreateIndicatorSourceDto,
  ): Promise<IndicatorSource> {
    return await this.indicatorSourcesService.serialize(
      await this.indicatorSourcesService.create(dto),
    );
  }

  @ApiOperation({ description: 'Updates a indicator source' })
  @ApiOkResponse({ type: IndicatorSource })
  @Patch(':id')
  async update(
    @Body(new ValidationPipe()) dto: UpdateIndicatorSourceDto,
    @Param('id') id: string,
  ): Promise<IndicatorSource> {
    return await this.indicatorSourcesService.serialize(
      await this.indicatorSourcesService.update(id, dto),
    );
  }

  @ApiOperation({ description: 'Deletes a indicator source' })
  @ApiOkResponse()
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.indicatorSourcesService.remove(id);
  }
}

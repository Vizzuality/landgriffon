import { Controller, Get, Param, Query, ValidationPipe } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  ContextualLayer,
  ContextualLayerByCategory,
} from 'modules/contextual-layers/contextual-layer.entity';
import { ContextualLayersService } from 'modules/contextual-layers/contextual-layers.service';
import { H3IndexValueData } from 'modules/h3-data/h3-data.entity';
import { GetContextualLayerH3Dto } from 'modules/contextual-layers//dto/get-contextual-layer-h3.dto';
import { GetContextualLayerH3ResponseDto } from 'modules/contextual-layers//dto/get-contextual-layer-h3-response.dto';

@Controller('api/v1/contextual-layers')
@ApiTags(ContextualLayer.name)
@ApiBearerAuth()
export class ContextualLayersController {
  constructor(
    private readonly contextualLayerService: ContextualLayersService,
  ) {}
  @ApiOperation({
    description: 'Get all Contextual Layer info grouped by Category',
  })
  @ApiOkResponse({
    type: ContextualLayerByCategory,
    isArray: true,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Get('/categories')
  async getContextualLayersByCategory(): Promise<{
    data: ContextualLayerByCategory[];
  }> {
    const contextualLayersByCategory: ContextualLayerByCategory[] =
      await this.contextualLayerService.getContextualLayersByCategory();

    return { data: contextualLayersByCategory };
  }

  @ApiOperation({
    description:
      'Returns all the H3 index data for this given contextual layer, resolution and optionally year',
  })
  @ApiOkResponse({
    type: GetContextualLayerH3ResponseDto,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Get('/:id/h3data')
  async getContextualLayerH3(
    @Param('id') contextualLayerId: string,
    @Query(ValidationPipe) queryParams: GetContextualLayerH3Dto,
  ): Promise<{ data: H3IndexValueData[]; metadata: any }> {
    return this.contextualLayerService.getContextualLayerH3(
      contextualLayerId,
      queryParams.resolution,
      queryParams.year,
    );
  }
}

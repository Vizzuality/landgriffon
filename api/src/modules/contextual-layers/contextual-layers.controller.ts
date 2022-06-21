import { Controller, Get } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ContextualLayerByCategory } from 'modules/contextual-layers/contextual-layer.entity';
import { ContextualLayersService } from 'modules/contextual-layers/contextual-layers.service';

@Controller('api/v1/contextual-layers')
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
}

import { Controller, Get } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ContextualLayer } from 'modules/contextual-layers/contextual-layer.entity';

@Controller('api/v1/contextual-layers')
export class ContextualLayersController {
  @ApiOperation({
    description: 'Get all Contextual Layer info ordered by Category',
  })
  @ApiOkResponse({
    type: ContextualLayer,
    isArray: true,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Get('/categories')
  async getContextualLayerByCategory(): Promise<any> {
    return;
  }
}

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
import { LayersService } from 'modules/layers/layers.service';
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
import { Layer, LayerResource } from 'modules/layers/layer.entity';
import { CreateLayerDto } from 'modules/layers/dto/create.layer.dto';
import { UpdateLayerDto } from 'modules/layers/dto/update.layer.dto';

@Controller(`/api/v1/layers`)
@ApiTags(LayerResource.className)
export class LayersController {
  constructor(public readonly layersService: LayersService) {}

  @ApiOperation({
    description: 'Find all layers',
  })
  @ApiOkResponse({
    type: Layer,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams()
  @Get()
  async findAll(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<Layer> {
    const results = await this.layersService.findAllPaginated(
      fetchSpecification,
    );
    return this.layersService.serialize(results.data, results.metadata);
  }

  @ApiOperation({ description: 'Find layer by id' })
  @ApiOkResponse({ type: Layer })
  @JSONAPISingleEntityQueryParams()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Layer> {
    return await this.layersService.serialize(
      await this.layersService.getById(id),
    );
  }

  @ApiOperation({ description: 'Create a layer' })
  @ApiOkResponse({ type: Layer })
  @Post()
  async create(@Body() dto: CreateLayerDto): Promise<Layer> {
    return await this.layersService.serialize(
      await this.layersService.create(dto),
    );
  }

  @ApiOperation({ description: 'Updates a layer' })
  @ApiOkResponse({ type: Layer })
  @Patch(':id')
  async update(
    @Body(new ValidationPipe()) dto: UpdateLayerDto,
    @Param('id') id: string,
  ): Promise<Layer> {
    return await this.layersService.serialize(
      await this.layersService.update(id, dto),
    );
  }

  @ApiOperation({ description: 'Deletes a layer' })
  @ApiOkResponse()
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.layersService.remove(id);
  }
}

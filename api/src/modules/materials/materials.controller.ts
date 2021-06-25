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
import { MaterialsService } from 'modules/materials/materials.service';
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
import { Material, materialResource } from 'modules/materials/material.entity';
import { CreateMaterialDto } from 'modules/materials/dto/create.material.dto';
import { UpdateMaterialDto } from 'modules/materials/dto/update.material.dto';

@Controller(`/api/v1/materials`)
@ApiTags(materialResource.className)
export class MaterialsController {
  constructor(public readonly service: MaterialsService) {}

  @ApiOperation({
    description: 'Find all materials',
  })
  @ApiOkResponse({
    type: Material,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams()
  @Get()
  async findAll(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<Material> {
    const results = await this.service.findAllPaginated(fetchSpecification);
    return this.service.serialize(results.data, results.metadata);
  }

  @ApiOperation({ description: 'Find material by id' })
  @ApiOkResponse({ type: Material })
  @JSONAPISingleEntityQueryParams()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Material> {
    return await this.service.serialize(await this.service.getById(id));
  }

  @ApiOperation({ description: 'Create a material' })
  @ApiOkResponse({ type: Material })
  @Post()
  async create(@Body() dto: CreateMaterialDto): Promise<Material> {
    return await this.service.serialize(await this.service.create(dto));
  }

  @ApiOperation({ description: 'Updates a material' })
  @ApiOkResponse({ type: Material })
  @Patch(':id')
  async update(
    @Body(new ValidationPipe()) dto: UpdateMaterialDto,
    @Param('id') id: string,
  ): Promise<Material> {
    return await this.service.serialize(await this.service.update(id, dto));
  }

  @ApiOperation({ description: 'Deletes a material' })
  @ApiOkResponse()
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.service.remove(id);
  }
}

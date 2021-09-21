import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MaterialsService } from 'modules/materials/materials.service';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
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
import { MaterialRepository } from 'modules/materials/material.repository';
import { ApiOkTreeResponse } from 'decorators/api-tree-response.decorator';
import { ParseOptionalIntPipe } from 'pipes/parse-optional-int.pipe';
import { Unit } from 'modules/units/unit.entity';

@Controller(`/api/v1/materials`)
@ApiTags(materialResource.className)
export class MaterialsController {
  constructor(
    public readonly materialsService: MaterialsService,
    public readonly materialsRepository: MaterialRepository,
  ) {}

  @ApiOperation({
    description: 'Find all materials and return them in a list format',
  })
  @ApiOkResponse({
    type: Material,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams({
    availableFilters: materialResource.columnsAllowedAsFilter.map(
      (columnName: string) => ({
        name: columnName,
      }),
    ),
    entitiesAllowedAsIncludes: materialResource.entitiesAllowedAsIncludes,
  })
  @Get()
  async findAll(
    @ProcessFetchSpecification({
      allowedFilters: materialResource.columnsAllowedAsFilter,
    })
    fetchSpecification: FetchSpecification,
  ): Promise<Material> {
    const results = await this.materialsService.findAllPaginated(
      fetchSpecification,
    );
    return this.materialsService.serialize(results.data, results.metadata);
  }

  @ApiOperation({
    description:
      'Find all materials and return them in a tree format. Data in the "children" will recursively extend for the full depth of the tree',
  })
  @ApiOkTreeResponse({
    treeNodeType: Material,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Get('/trees')
  @ApiQuery({
    name: 'depth',
    required: false,
    description:
      'A non-negative integer value. If specified, limits the depth of the tree crawling. 0 will return only the tree roots',
  })
  async getTrees(
    @Query('depth', ParseOptionalIntPipe) depth?: number,
  ): Promise<Material> {
    const results = await this.materialsRepository.findTreesWithOptions({
      depth,
    });
    return this.materialsService.serialize(results);
  }

  @ApiOperation({ description: 'Find material by id' })
  @ApiOkResponse({ type: Material })
  @JSONAPISingleEntityQueryParams()
  @Get(':id')
  async findOne(
    @ProcessFetchSpecification({
      allowedFilters: materialResource.columnsAllowedAsFilter,
    })
    fetchSpecification: FetchSpecification,
    @Param('id') id: string,
  ): Promise<Material & Pick<Unit, 'name'> & Pick<Unit, 'symbol'>> {
    const material = await this.materialsService.getById(
      id,
      fetchSpecification,
    );
    // TODO: Hardcoded value to unblock FE. Remove this ASA Science can provide this data
    const materialWithUnit = {
      ...material,
      unit: { symbol: 'tons' },
    };

    return await this.materialsService.serialize(materialWithUnit);
  }

  @ApiOperation({ description: 'Create a material' })
  @ApiOkResponse({ type: Material })
  @Post()
  @UsePipes(ValidationPipe)
  async create(@Body() dto: CreateMaterialDto): Promise<Material> {
    return await this.materialsService.serialize(
      await this.materialsService.create(dto),
    );
  }

  @ApiOperation({ description: 'Updates a material' })
  @ApiOkResponse({ type: Material })
  @Patch(':id')
  async update(
    @Body(new ValidationPipe()) dto: UpdateMaterialDto,
    @Param('id') id: string,
  ): Promise<Material> {
    return await this.materialsService.serialize(
      await this.materialsService.update(id, dto),
    );
  }

  @ApiOperation({ description: 'Deletes a material' })
  @ApiOkResponse()
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.materialsService.remove(id);
  }
}

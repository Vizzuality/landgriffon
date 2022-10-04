import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MaterialsService } from 'modules/materials/materials.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
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
import { MaterialRepository } from 'modules/materials/material.repository';
import { ApiOkTreeResponse } from 'decorators/api-tree-response.decorator';
import { PaginationMeta } from 'utils/app-base.service';
import { GetMaterialTreeWithOptionsDto } from 'modules/materials/dto/get-material-tree-with-options.dto';
import { SetScenarioIdsInterceptor } from 'modules/impact/set-scenario-ids.interceptor';

@Controller(`/api/v1/materials`)
@ApiTags(materialResource.className)
@ApiBearerAuth()
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
    const results: {
      data: (Partial<Material> | undefined)[];
      metadata: PaginationMeta | undefined;
    } = await this.materialsService.findAllPaginated(fetchSpecification);
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
  @UseInterceptors(SetScenarioIdsInterceptor)
  @Get('/trees')
  async getTrees(
    @Query(ValidationPipe) materialTreeOptions: GetMaterialTreeWithOptionsDto,
  ): Promise<Material> {
    const results: Material[] = await this.materialsService.getTrees(
      materialTreeOptions,
    );
    return this.materialsService.serialize(results);
  }

  @ApiOperation({ description: 'Find material by id' })
  @ApiNotFoundResponse({ description: 'Material not found' })
  @ApiOkResponse({ type: Material })
  @JSONAPISingleEntityQueryParams()
  @Get(':id')
  async findOne(
    @ProcessFetchSpecification({
      allowedFilters: materialResource.columnsAllowedAsFilter,
    })
    fetchSpecification: FetchSpecification,
    @Param('id') id: string,
  ): Promise<Material> {
    return await this.materialsService.serialize(
      await this.materialsService.getById(id, fetchSpecification),
    );
  }

  @ApiOperation({ description: 'Create a material' })
  @ApiOkResponse({ type: Material })
  @ApiBadRequestResponse({
    description: 'Bad Request. Incorrect or missing parameters',
  })
  @Post()
  @UsePipes(ValidationPipe)
  async create(@Body() dto: CreateMaterialDto): Promise<Material> {
    return await this.materialsService.serialize(
      await this.materialsService.create(dto),
    );
  }

  @ApiOperation({ description: 'Updates a material' })
  @ApiNotFoundResponse({ description: 'Material not found' })
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
  @ApiNotFoundResponse({ description: 'Material not found' })
  @ApiOkResponse()
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.materialsService.remove(id);
  }
}

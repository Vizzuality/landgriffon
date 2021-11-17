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
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';
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
import {
  AdminRegion,
  adminRegionResource,
} from 'modules/admin-regions/admin-region.entity';
import { CreateAdminRegionDto } from 'modules/admin-regions/dto/create.admin-region.dto';
import { UpdateAdminRegionDto } from 'modules/admin-regions/dto/update.admin-region.dto';
import { PaginationMeta } from 'utils/app-base.service';
import { ApiOkTreeResponse } from 'decorators/api-tree-response.decorator';
import { ParseOptionalIntPipe } from 'pipes/parse-optional-int.pipe';

@Controller(`/api/v1/admin-regions`)
@ApiTags(adminRegionResource.className)
export class AdminRegionsController {
  constructor(public readonly adminRegionsService: AdminRegionsService) {}

  @ApiOperation({
    description: 'Find all admin regions',
  })
  @ApiOkResponse({
    type: AdminRegion,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams({
    availableFilters: adminRegionResource.columnsAllowedAsFilter.map(
      (columnName: string) => ({
        name: columnName,
      }),
    ),
  })
  @Get()
  async findAll(
    @ProcessFetchSpecification({
      allowedFilters: adminRegionResource.columnsAllowedAsFilter,
    })
    fetchSpecification: FetchSpecification,
  ): Promise<AdminRegion> {
    const results: {
      data: (Partial<AdminRegion> | undefined)[];
      metadata: PaginationMeta | undefined;
    } = await this.adminRegionsService.findAllPaginated(fetchSpecification);
    return this.adminRegionsService.serialize(results.data, results.metadata);
  }

  @ApiOperation({
    description:
      'Find all admin regions and return them in a tree format. Data in the "children" will recursively extend for the full depth of the tree',
  })
  @ApiOkTreeResponse({
    treeNodeType: AdminRegion,
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
  ): Promise<AdminRegion> {
    const results: AdminRegion[] = await this.adminRegionsService.findTreesWithOptions(
      {
        depth,
      },
    );
    return this.adminRegionsService.serialize(results);
  }

  @ApiOperation({ description: 'Find admin region by id' })
  @ApiOkResponse({ type: AdminRegion })
  @JSONAPISingleEntityQueryParams()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<AdminRegion> {
    return await this.adminRegionsService.serialize(
      await this.adminRegionsService.getById(id),
    );
  }

  @ApiOperation({ description: 'Create a admin region' })
  @ApiOkResponse({ type: AdminRegion })
  @Post()
  @UsePipes(ValidationPipe)
  async create(@Body() dto: CreateAdminRegionDto): Promise<AdminRegion> {
    return await this.adminRegionsService.serialize(
      await this.adminRegionsService.create(dto),
    );
  }

  @ApiOperation({ description: 'Updates a admin region' })
  @ApiOkResponse({ type: AdminRegion })
  @Patch(':id')
  async update(
    @Body(new ValidationPipe()) dto: UpdateAdminRegionDto,
    @Param('id') id: string,
  ): Promise<AdminRegion> {
    return await this.adminRegionsService.serialize(
      await this.adminRegionsService.update(id, dto),
    );
  }

  @ApiOperation({ description: 'Deletes a admin region' })
  @ApiOkResponse()
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.adminRegionsService.remove(id);
  }
}

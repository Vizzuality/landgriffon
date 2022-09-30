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
import { BusinessUnitsService } from 'modules/business-units/business-units.service';
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
import {
  BusinessUnit,
  businessUnitResource,
} from 'modules/business-units/business-unit.entity';
import { CreateBusinessUnitDto } from 'modules/business-units/dto/create.business-unit.dto';
import { UpdateBusinessUnitDto } from 'modules/business-units/dto/update.business-unit.dto';
import { PaginationMeta } from 'utils/app-base.service';
import { ApiOkTreeResponse } from 'decorators/api-tree-response.decorator';
import { GetBusinessUnitTreeWithOptionsDto } from 'modules/business-units/dto/get-business-unit-tree-with-options.dto';
import { SetScenarioIdsInterceptor } from 'modules/impact/set-scenario-ids.interceptor';

@Controller(`/api/v1/business-units`)
@ApiTags(businessUnitResource.className)
@ApiBearerAuth()
export class BusinessUnitsController {
  constructor(public readonly businessUnitsService: BusinessUnitsService) {}

  @ApiOperation({
    description: 'Find all business units',
  })
  @ApiOkResponse({
    type: BusinessUnit,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams({
    availableFilters: businessUnitResource.columnsAllowedAsFilter.map(
      (columnName: string) => ({
        name: columnName,
      }),
    ),
  })
  @Get()
  async findAll(
    @ProcessFetchSpecification({
      allowedFilters: businessUnitResource.columnsAllowedAsFilter,
    })
    fetchSpecification: FetchSpecification,
  ): Promise<BusinessUnit> {
    const results: {
      data: (Partial<BusinessUnit> | undefined)[];
      metadata: PaginationMeta | undefined;
    } = await this.businessUnitsService.findAllPaginated(fetchSpecification);
    return this.businessUnitsService.serialize(results.data, results.metadata);
  }

  @ApiOperation({
    description:
      'Find all business units with sourcing-locations and return them in a tree format.',
  })
  @ApiOkTreeResponse({
    treeNodeType: BusinessUnit,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @UseInterceptors(SetScenarioIdsInterceptor)
  @Get('/trees')
  // TODO: Implement Tree response similar to other entities as Admin-Regions
  async getTrees(
    @Query(ValidationPipe)
    businessUnitTreeOptions: GetBusinessUnitTreeWithOptionsDto,
  ): Promise<BusinessUnit[]> {
    const results: BusinessUnit[] = await this.businessUnitsService.getTrees(
      businessUnitTreeOptions,
    );
    return this.businessUnitsService.serialize(results);
  }

  @ApiOperation({ description: 'Find business unit by id' })
  @ApiOkResponse({ type: BusinessUnit })
  @ApiNotFoundResponse({ description: 'Business unit not found' })
  @JSONAPISingleEntityQueryParams()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<BusinessUnit> {
    return await this.businessUnitsService.serialize(
      await this.businessUnitsService.getById(id),
    );
  }

  @ApiOperation({ description: 'Create a business unit' })
  @ApiOkResponse({ type: BusinessUnit })
  @ApiBadRequestResponse({
    description: 'Bad Request. Incorrect or missing parameters',
  })
  @Post()
  @UsePipes(ValidationPipe)
  async create(@Body() dto: CreateBusinessUnitDto): Promise<BusinessUnit> {
    return await this.businessUnitsService.serialize(
      await this.businessUnitsService.create(dto),
    );
  }

  @ApiOperation({ description: 'Updates a business unit' })
  @ApiNotFoundResponse({ description: 'Business unit not found' })
  @ApiOkResponse({ type: BusinessUnit })
  @Patch(':id')
  async update(
    @Body(new ValidationPipe()) dto: UpdateBusinessUnitDto,
    @Param('id') id: string,
  ): Promise<BusinessUnit> {
    return await this.businessUnitsService.serialize(
      await this.businessUnitsService.update(id, dto),
    );
  }

  @ApiOperation({ description: 'Deletes a business unit' })
  @ApiNotFoundResponse({ description: 'Business unit not found' })
  @ApiOkResponse()
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.businessUnitsService.remove(id);
  }
}

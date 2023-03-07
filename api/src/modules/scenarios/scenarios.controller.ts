import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ScenariosService } from 'modules/scenarios/scenarios.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
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
import { Scenario, scenarioResource } from 'modules/scenarios/scenario.entity';
import { CreateScenarioDto } from 'modules/scenarios/dto/create.scenario.dto';
import { UpdateScenarioDto } from 'modules/scenarios/dto/update.scenario.dto';
import { PaginationMeta } from 'utils/app-base.service';
import { SetUserInterceptor } from 'decorators/set-user.interceptor';
import { Intervention } from 'modules/interventions/intervention.entity';
import { UserOwnsScenario } from 'modules/authorization/modules/scenario-ownership.interceptor';

@Controller(`/api/v1/scenarios`)
@ApiTags(scenarioResource.className)
@ApiBearerAuth()
export class ScenariosController {
  constructor(public readonly scenariosService: ScenariosService) {}

  @ApiOperation({
    description: 'Find all scenarios',
  })
  @ApiQuery({
    required: false,
    name: 'hasActiveInterventions',
    type: 'boolean',
    description:
      'If true, only scenarios with at least one active intervention will be selected.',
  })
  @ApiQuery({
    //TODO wile a more generic way to approach this is pending to be developed on the nestjs-base-service, only title is supported for now
    name: 'search',
    type: 'Map<string, string>',
    description:
      'Must be provided when searching with partial matching. Each key of the map corresponds to a field that is to be matched partially, and its value, the string that will be partially matched against',
  })
  @ApiOkResponse({
    type: Scenario,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams({
    availableFilters: scenarioResource.columnsAllowedAsFilter.map(
      (columnName: string) => ({
        name: columnName,
      }),
    ),
  })
  @Get()
  async findAll(
    @ProcessFetchSpecification({
      allowedFilters: scenarioResource.columnsAllowedAsFilter,
    })
    fetchSpecification: FetchSpecification,
  ): Promise<Scenario> {
    const results: {
      data: (Partial<Scenario> | undefined)[];
      metadata: PaginationMeta | undefined;
    } = await this.scenariosService.findAllPaginated(fetchSpecification);
    return this.scenariosService.serialize(results.data, results.metadata);
  }

  @ApiOperation({ description: 'Find scenario by id' })
  @ApiOkResponse({ type: Scenario })
  @ApiNotFoundResponse({ description: 'Scenario not found' })
  @JSONAPISingleEntityQueryParams({
    availableFilters: scenarioResource.columnsAllowedAsFilter.map(
      (columnName: string) => ({
        name: columnName,
      }),
    ),
  })
  @UserOwnsScenario({ bypassIfScenarioIsPublic: true })
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @ProcessFetchSpecification({
      allowedFilters: scenarioResource.columnsAllowedAsFilter,
    })
    fetchSpecification: FetchSpecification,
  ): Promise<Scenario> {
    return await this.scenariosService.serialize(
      await this.scenariosService.getById(id, fetchSpecification),
    );
  }

  @ApiOperation({
    description: 'Find all Interventions that belong to a given Scenario Id',
  })
  @ApiOkResponse({ type: Scenario })
  @ApiNotFoundResponse({ description: 'Scenario not found' })
  @JSONAPISingleEntityQueryParams()
  @UserOwnsScenario({ bypassIfScenarioIsPublic: true })
  @Get(':id/interventions')
  async findInterventionsByScenario(
    @Param('id') id: string,
  ): Promise<Intervention[]> {
    return this.scenariosService.findInterventionsByScenario(id);
  }

  @ApiOperation({ description: 'Create a scenario' })
  @ApiOkResponse({ type: Scenario })
  @ApiBadRequestResponse({
    description: 'Bad Request. Incorrect or missing parameters',
  })
  @UseInterceptors(SetUserInterceptor)
  @Post()
  async create(@Body() dto: CreateScenarioDto): Promise<Scenario> {
    return await this.scenariosService.serialize(
      await this.scenariosService.create(dto),
    );
  }

  @ApiOperation({ description: 'Updates a scenario' })
  @ApiOkResponse({ type: Scenario })
  @ApiNotFoundResponse({ description: 'Scenario not found' })
  @UseInterceptors(SetUserInterceptor)
  @UserOwnsScenario()
  @Patch(':id')
  async update(
    @Body(new ValidationPipe()) dto: UpdateScenarioDto,
    @Param('id') id: string,
  ): Promise<Scenario> {
    return await this.scenariosService.serialize(
      await this.scenariosService.update(id, dto),
    );
  }

  @ApiOperation({ description: 'Deletes a scenario' })
  @ApiOkResponse()
  @ApiNotFoundResponse({ description: 'Scenario not found' })
  @UserOwnsScenario()
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.scenariosService.remove(id);
  }
}

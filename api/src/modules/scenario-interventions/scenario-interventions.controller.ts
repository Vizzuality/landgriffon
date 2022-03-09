import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ScenarioInterventionsService } from 'modules/scenario-interventions/scenario-interventions.service';
import {
  ApiBadRequestResponse,
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
  ScenarioIntervention,
  scenarioResource,
} from 'modules/scenario-interventions/scenario-intervention.entity';
import { CreateScenarioInterventionDto } from 'modules/scenario-interventions/dto/create.scenario-intervention.dto';
import { UpdateScenarioInterventionDto } from 'modules/scenario-interventions/dto/update.scenario-intervention.dto';
import { PaginationMeta } from 'utils/app-base.service';

@Controller(`/api/v1/scenario-interventions`)
@ApiTags(scenarioResource.className)
export class ScenarioInterventionsController {
  constructor(public readonly scenariosService: ScenarioInterventionsService) {}

  @ApiOperation({
    description: 'Find all scenarios',
  })
  @ApiOkResponse({
    type: ScenarioIntervention,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams()
  @Get()
  async findAll(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<ScenarioIntervention> {
    const results: {
      data: (Partial<ScenarioIntervention> | undefined)[];
      metadata: PaginationMeta | undefined;
    } = await this.scenariosService.findAllPaginated(fetchSpecification);
    return this.scenariosService.serialize(results.data, results.metadata);
  }

  @ApiOperation({ description: 'Find scenario intervention by id' })
  @ApiOkResponse({ type: ScenarioIntervention })
  @ApiNotFoundResponse({ description: 'Scenario intervention not found' })
  @JSONAPISingleEntityQueryParams()
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<ScenarioIntervention> {
    return await this.scenariosService.serialize(
      await this.scenariosService.getById(id, fetchSpecification),
    );
  }

  @ApiOperation({ description: 'Create a scenario intervention' })
  @ApiOkResponse({ type: ScenarioIntervention })
  @ApiBadRequestResponse({
    description: 'Bad Request. Incorrect or missing parameters',
  })
  @UsePipes(ValidationPipe)
  @Post()
  async create(
    @Body() dto: CreateScenarioInterventionDto,
  ): Promise<ScenarioIntervention> {
    return this.scenariosService.serialize(
      await this.scenariosService.createScenarioIntervention(dto),
    );
  }

  @ApiOperation({ description: 'Update a scenario intervention' })
  @ApiOkResponse({ type: ScenarioIntervention })
  @ApiNotFoundResponse({ description: 'Scenario intervention not found' })
  @UsePipes(ValidationPipe)
  @Patch(':id')
  async update(
    @Body(new ValidationPipe()) dto: UpdateScenarioInterventionDto,
    @Param('id') id: string,
  ): Promise<ScenarioIntervention> {
    return await this.scenariosService.serialize(
      await this.scenariosService.update(id, dto),
    );
  }

  @ApiOperation({ description: 'Delete a scenario intervention' })
  @ApiOkResponse()
  @ApiNotFoundResponse({ description: 'Scenario intervention not found' })
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.scenariosService.remove(id);
  }
}

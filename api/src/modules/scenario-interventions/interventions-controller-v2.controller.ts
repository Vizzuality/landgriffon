import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ScenarioInterventionsService } from 'modules/scenario-interventions/scenario-interventions.service';
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
  ScenarioIntervention,
  scenarioResource,
} from 'modules/scenario-interventions/scenario-intervention.entity';
import { CreateScenarioInterventionDtoV2 } from 'modules/scenario-interventions/dto/create.scenario-intervention.dto';
import { UpdateScenarioInterventionDto } from 'modules/scenario-interventions/dto/update.scenario-intervention.dto';
import { PaginationMeta } from 'utils/app-base.service';
import { SetUserInterceptor } from 'decorators/set-user.interceptor';
import { MaterialsService } from 'modules/materials/materials.service';

@Controller(`/api/v1/scenario-interventions`)
@ApiTags(scenarioResource.className)
@ApiBearerAuth()
export class ScenarioInterventionsControllerV2 {
  constructor(
    public readonly scenarioInterventionsService: ScenarioInterventionsService,
    public readonly materialsService: MaterialsService,
  ) {}

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
    } = await this.scenarioInterventionsService.findAllPaginated(
      fetchSpecification,
    );
    return this.scenarioInterventionsService.serialize(
      results.data,
      results.metadata,
    );
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
    return await this.scenarioInterventionsService.serialize(
      await this.scenarioInterventionsService.getById(id, fetchSpecification),
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
    @Body() dto: CreateScenarioInterventionDtoV2,
  ): Promise<Partial<ScenarioIntervention>> {
    if (dto.newMaterialId)
      await this.materialsService.areRequestedMaterialsActive([
        dto.newMaterialId,
      ]);
    return await this.scenarioInterventionsService.serialize(
      await this.scenarioInterventionsService.createScenarioIntervention(dto),
    );
  }

  @ApiOperation({ description: 'Update a scenario intervention' })
  @ApiOkResponse({ type: ScenarioIntervention })
  @ApiNotFoundResponse({ description: 'Scenario intervention not found' })
  @UsePipes(ValidationPipe)
  @UseInterceptors(SetUserInterceptor)
  @Patch(':id')
  async update(
    @Body(new ValidationPipe()) dto: UpdateScenarioInterventionDto,
    @Param('id') id: string,
  ): Promise<ScenarioIntervention> {
    return await this.scenarioInterventionsService.serialize(
      await this.scenarioInterventionsService.updateIntervention(id, dto),
    );
  }

  @ApiOperation({ description: 'Delete a scenario intervention' })
  @ApiOkResponse()
  @ApiNotFoundResponse({ description: 'Scenario intervention not found' })
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.scenarioInterventionsService.remove(id);
  }
}

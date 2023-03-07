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
import { InterventionsService } from 'modules/interventions/interventions.service';
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
  Intervention,
  scenarioResource,
} from 'modules/interventions/intervention.entity';
import { CreateInterventionDto } from 'modules/interventions/dto/create.intervention.dto';
import { UpdateInterventionDto } from 'modules/interventions/dto/update.intervention.dto';
import { PaginationMeta } from 'utils/app-base.service';
import { SetUserInterceptor } from 'decorators/set-user.interceptor';
import { MaterialsService } from 'modules/materials/materials.service';

@Controller(`/api/v1/scenario-interventions`)
@ApiTags(scenarioResource.className)
@ApiBearerAuth()
export class InterventionsController {
  constructor(
    public readonly scenarioInterventionsService: InterventionsService,
    public readonly materialsService: MaterialsService,
  ) {}

  @ApiOperation({
    description: 'Find all scenarios',
  })
  @ApiOkResponse({
    type: Intervention,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams()
  @Get()
  async findAll(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<Intervention> {
    const results: {
      data: (Partial<Intervention> | undefined)[];
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
  @ApiOkResponse({ type: Intervention })
  @ApiNotFoundResponse({ description: 'Scenario intervention not found' })
  @JSONAPISingleEntityQueryParams()
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<Intervention> {
    return await this.scenarioInterventionsService.serialize(
      await this.scenarioInterventionsService.getById(id, fetchSpecification),
    );
  }

  @ApiOperation({ description: 'Create a scenario intervention' })
  @ApiOkResponse({ type: Intervention })
  @ApiBadRequestResponse({
    description: 'Bad Request. Incorrect or missing parameters',
  })
  @UsePipes(ValidationPipe)
  @Post()
  async create(
    @Body() dto: CreateInterventionDto,
  ): Promise<Partial<Intervention>> {
    if (dto.newMaterialId)
      await this.materialsService.checkActiveMaterials([dto.newMaterialId]);
    return await this.scenarioInterventionsService.serialize(
      await this.scenarioInterventionsService.createScenarioIntervention(dto),
    );
  }

  @ApiOperation({ description: 'Update a scenario intervention' })
  @ApiOkResponse({ type: Intervention })
  @ApiNotFoundResponse({ description: 'Scenario intervention not found' })
  @UsePipes(ValidationPipe)
  @UseInterceptors(SetUserInterceptor)
  @Patch(':id')
  async update(
    @Body(new ValidationPipe()) dto: UpdateInterventionDto,
    @Param('id') id: string,
  ): Promise<Intervention> {
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

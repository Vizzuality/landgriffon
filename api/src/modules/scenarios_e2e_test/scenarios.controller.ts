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
import { ScenarioIntervention } from 'modules/scenario-interventions/scenario-intervention.entity';
import { UserOwnsScenario } from 'modules/authorization/modules/scenario-ownership.interceptor';
import {
  Api,
  nestControllerContract,
  NestRequestShapes,
  NestResponseShapes,
  TsRest,
  TsRestRequest,
} from '@ts-rest/nest';

import { ScenarioContract } from 'contracts/scenarios/scenario.contract';

const c = nestControllerContract(ScenarioContract);
type RequestShapes = NestRequestShapes<typeof c>;
type ResponseShapes = NestResponseShapes<typeof c>;

@Controller(`/api/v1/scenarios_e2e_test`)
@ApiTags('scenarios_e2e_test')
@ApiBearerAuth()
@TsRest({ validateResponses: true })
export class ScenariosController {
  constructor(public readonly scenariosService: ScenariosService) {}

  @ApiOperation({ description: 'Create a scenario' })
  @ApiOkResponse({ type: Scenario })
  @ApiBadRequestResponse({
    description: 'Bad Request. Incorrect or missing parameters',
  })
  @UseInterceptors(SetUserInterceptor)
  @Post()
  @TsRest(c.createScenario)
  async create(
    @TsRestRequest()
    { body: CreateScenarioDto }: RequestShapes['createScenario'],
    @Body() dto: CreateScenarioDto,
  ): Promise<ResponseShapes['createScenario']> {
    return await this.scenariosService.serialize(
      await this.scenariosService.create(dto),
    );
    //return new Scenario();
  }
}

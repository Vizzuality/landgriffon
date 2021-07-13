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
import { ScenariosService } from 'modules/scenarios/scenarios.service';
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
import { Scenario, scenarioResource } from 'modules/scenarios/scenario.entity';
import { CreateScenarioDto } from 'modules/scenarios/dto/create.scenario.dto';
import { UpdateScenarioDto } from 'modules/scenarios/dto/update.scenario.dto';

@Controller(`/api/v1/scenarios`)
@ApiTags(scenarioResource.className)
export class ScenariosController {
  constructor(public readonly scenariosService: ScenariosService) {}

  @ApiOperation({
    description: 'Find all scenarios',
  })
  @ApiOkResponse({
    type: Scenario,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams()
  @Get()
  async findAll(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<Scenario> {
    const results = await this.scenariosService.findAllPaginated(
      fetchSpecification,
    );
    return this.scenariosService.serialize(results.data, results.metadata);
  }

  @ApiOperation({ description: 'Find scenario by id' })
  @ApiOkResponse({ type: Scenario })
  @JSONAPISingleEntityQueryParams()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Scenario> {
    return await this.scenariosService.serialize(
      await this.scenariosService.getById(id),
    );
  }

  @ApiOperation({ description: 'Create a scenario' })
  @ApiOkResponse({ type: Scenario })
  @Post()
  async create(@Body() dto: CreateScenarioDto): Promise<Scenario> {
    return await this.scenariosService.serialize(
      await this.scenariosService.create(dto),
    );
  }

  @ApiOperation({ description: 'Updates a scenario' })
  @ApiOkResponse({ type: Scenario })
  @Patch(':id')
  async update(
    @Body(new ValidationPipe()) dto: UpdateScenarioDto,
    @Param('id') id: string,
  ): Promise<Scenario> {
    const res = await this.scenariosService.update(id, dto);
    console.log('SCENARIO', res);
    return await this.scenariosService.serialize(res);
    // return await this.scenariosService.serialize(
    //   await this.scenariosService.update(id, dto),
    // );
  }

  @ApiOperation({ description: 'Deletes a scenario' })
  @ApiOkResponse()
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.scenariosService.remove(id);
  }
}

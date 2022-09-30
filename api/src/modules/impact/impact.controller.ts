import {
  Controller,
  Get,
  Query,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import {
  GetActualVsScenarioImpactTableDto,
  GetScenarioVsScenarioImpactTableDto,
  GetImpactTableDto,
  GetRankedImpactTableDto,
} from 'modules/impact/dto/impact-table.dto';
import { ImpactService } from 'modules/impact/impact.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  ImpactTable,
  PaginatedImpactTable,
} from 'modules/impact/dto/response-impact-table.dto';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';
import { JSONAPIPaginationQueryParams } from 'decorators/json-api-parameters.decorator';
import { ActualVsScenarioImpactService } from 'modules/impact/comparison/actual-vs-scenario.service';
import { PaginatedScenariosImpactTable } from 'modules/impact/dto/response-comparison-table.dto';
import { SetScenarioIdsInterceptor } from './set-scenario-ids.interceptor';
import { ScenarioVsScenarioImpactService } from './scenario-vs-scenario.service';
import { ScenarioVsScenarioPaginatedImpactTable } from './dto/response-scenario-scenario.dto';

@Controller('/api/v1/impact')
@ApiTags('Impact')
@ApiBearerAuth()
export class ImpactController {
  constructor(
    private readonly impactService: ImpactService,
    private readonly actualVsScenarioImpactService: ActualVsScenarioImpactService,
    private readonly scenarioVsScenarioService: ScenarioVsScenarioImpactService,
  ) {}

  @ApiOperation({
    description: 'Get data for Impact Table',
  })
  @ApiOkResponse({
    type: PaginatedImpactTable,
  })
  @JSONAPIPaginationQueryParams()
  @Get('table')
  async getImpactTable(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
    @Query(ValidationPipe) impactTableDto: GetImpactTableDto,
  ): Promise<PaginatedImpactTable> {
    return await this.impactService.getImpactTable(
      impactTableDto,
      fetchSpecification,
    );
  }

  @ApiOperation({
    description: 'Get data for comparing Impacts of 2 Scenarios',
  })
  @ApiOkResponse({
    type: PaginatedImpactTable,
  })
  @JSONAPIPaginationQueryParams()
  @UseInterceptors(SetScenarioIdsInterceptor)
  @Get('compare/scenario/vs/scenario')
  async getTwoScenariosImpactTable(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
    @Query(ValidationPipe)
    scenarioVsScenarioImpactTableDto: GetScenarioVsScenarioImpactTableDto,
  ): Promise<ScenarioVsScenarioPaginatedImpactTable> {
    return await this.scenarioVsScenarioService.getScenarioVsScenarioImpactTable(
      scenarioVsScenarioImpactTableDto,
      fetchSpecification,
    );
  }

  @ApiOperation({
    description:
      'Get data for comapring Actual data with Scenario in form of Impact Table',
  })
  @ApiOkResponse({
    type: PaginatedImpactTable,
  })
  @JSONAPIPaginationQueryParams()
  @UseInterceptors(SetScenarioIdsInterceptor)
  @Get('compare/scenario/vs/actual')
  async getActualVsScenarioImpactTable(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
    @Query(ValidationPipe)
    actualvsScenarioImpactTableDto: GetActualVsScenarioImpactTableDto,
  ): Promise<PaginatedImpactTable> {
    return await this.actualVsScenarioImpactService.getActualVsScenarioImpactTable(
      actualvsScenarioImpactTableDto,
      fetchSpecification,
    );
  }

  @ApiOperation({
    description:
      'Get Ranked Impact Table, up to maxRankingEntities, aggregating the rest of entities, for each indicator ',
  })
  @ApiOkResponse({
    type: ImpactTable,
  })
  @JSONAPIPaginationQueryParams()
  @Get('ranking')
  async getRankedImpactTable(
    @Query(ValidationPipe) rankedImpactTableDto: GetRankedImpactTableDto,
  ): Promise<ImpactTable> {
    return await this.impactService.getRankedImpactTable(rankedImpactTableDto);
  }
}

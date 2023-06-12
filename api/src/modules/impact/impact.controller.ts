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
import { SetScenarioIdsInterceptor } from 'modules/impact/set-scenario-ids.interceptor';
import { ScenarioVsScenarioImpactService } from 'modules/impact/comparison/scenario-vs-scenario.service';
import { ScenarioVsScenarioPaginatedImpactTable } from 'modules/impact/dto/response-scenario-scenario.dto';
import { IndicatorsService } from 'modules/indicators/indicators.service';
import { MaterialsService } from 'modules/materials/materials.service';
import { CheckUserOwnsScenario } from 'modules/authorization/formodule/scenario-ownership.interceptor';

@Controller('/api/v1/impact')
@ApiTags('Impact')
@ApiBearerAuth()
export class ImpactController {
  constructor(
    private readonly impactService: ImpactService,
    private readonly actualVsScenarioImpactService: ActualVsScenarioImpactService,
    private readonly scenarioVsScenarioService: ScenarioVsScenarioImpactService,
    private readonly indicatorService: IndicatorsService,
    private readonly materialsService: MaterialsService,
  ) {}

  @ApiOperation({
    description: 'Get data for Impact Table',
  })
  @ApiOkResponse({
    type: PaginatedImpactTable,
  })
  @JSONAPIPaginationQueryParams()
  @UseInterceptors(SetScenarioIdsInterceptor)
  @Get('table')
  async getImpactTable(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
    @Query(ValidationPipe) impactTableDto: GetImpactTableDto,
  ): Promise<PaginatedImpactTable> {
    await this.indicatorService.areRequestedIndicatorsActive(
      impactTableDto.indicatorIds,
    );
    /* Here we are validating received materialIds to be active, without validating recursively possible descendants,
       since the Material Ids come from existing impact data (materials present in Sourcing Locations) and existing descendants
       will be active per default */
    if (impactTableDto.materialIds)
      await this.materialsService.areRequestedMaterialsActive(
        impactTableDto.materialIds,
      );
    return await this.impactService.getImpactTable(
      impactTableDto,
      fetchSpecification,
    );
  }

  @ApiOperation({
    description: 'Get data for comparing Impacts of 2 Scenarios',
  })
  @ApiOkResponse({
    type: ScenarioVsScenarioPaginatedImpactTable,
  })
  @JSONAPIPaginationQueryParams()
  @CheckUserOwnsScenario({
    bypassIfScenarioIsPublic: true,
    isComparisonMode: true,
  })
  @UseInterceptors(SetScenarioIdsInterceptor)
  @Get('compare/scenario/vs/scenario')
  async getTwoScenariosImpactTable(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
    @Query(ValidationPipe)
    scenarioVsScenarioImpactTableDto: GetScenarioVsScenarioImpactTableDto,
  ): Promise<ScenarioVsScenarioPaginatedImpactTable> {
    await this.indicatorService.areRequestedIndicatorsActive(
      scenarioVsScenarioImpactTableDto.indicatorIds,
    );
    /* Here we are validating received materialIds to be active, without validating recursively possible descendants,
      since the Material Ids come from existing impact data (materials present in Sourcing Locations) and existing descendants
      will be active per default */
    if (scenarioVsScenarioImpactTableDto.materialIds)
      await this.materialsService.areRequestedMaterialsActive(
        scenarioVsScenarioImpactTableDto.materialIds,
      );
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
  @CheckUserOwnsScenario({
    bypassIfScenarioIsPublic: true,
    isComparisonMode: true,
  })
  @UseInterceptors(SetScenarioIdsInterceptor)
  @Get('compare/scenario/vs/actual')
  async getActualVsScenarioImpactTable(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
    @Query(ValidationPipe)
    actualVsScenarioImpactTableDto: GetActualVsScenarioImpactTableDto,
  ): Promise<PaginatedImpactTable> {
    await this.indicatorService.areRequestedIndicatorsActive(
      actualVsScenarioImpactTableDto.indicatorIds,
    );
    /* Here we are validating received materialIds to be active, without validating recursively possible descendants,
      since the Material Ids come from existing impact data (materials present in Sourcing Locations) and existing descendants
      will be active per default */
    if (actualVsScenarioImpactTableDto.materialIds)
      await this.materialsService.areRequestedMaterialsActive(
        actualVsScenarioImpactTableDto.materialIds,
      );
    return await this.actualVsScenarioImpactService.getActualVsScenarioImpactTable(
      actualVsScenarioImpactTableDto,
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
  @UseInterceptors(SetScenarioIdsInterceptor)
  @JSONAPIPaginationQueryParams()
  @UseInterceptors(SetScenarioIdsInterceptor)
  @Get('ranking')
  async getRankedImpactTable(
    @Query(ValidationPipe) rankedImpactTableDto: GetRankedImpactTableDto,
  ): Promise<ImpactTable> {
    await this.indicatorService.areRequestedIndicatorsActive(
      rankedImpactTableDto.indicatorIds,
    );
    /* Here we are validating received materialIds to be active, without validating recursively possible descendants,
      since the Material Ids come from existing impact data (materials present in Sourcing Locations) and existing descendants
      will be active per default */
    if (rankedImpactTableDto.materialIds)
      await this.materialsService.areRequestedMaterialsActive(
        rankedImpactTableDto.materialIds,
      );
    return await this.impactService.getRankedImpactTable(rankedImpactTableDto);
  }
}

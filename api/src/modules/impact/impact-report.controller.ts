import {
  Controller,
  Get,
  Query,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ImpactService } from 'modules/impact/impact.service';
import { ActualVsScenarioImpactService } from 'modules/impact/comparison/actual-vs-scenario.service';
import { ScenarioVsScenarioImpactService } from 'modules/impact/comparison/scenario-vs-scenario.service';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import {
  ImpactTable,
  PaginatedImpactTable,
} from './dto/response-impact-table.dto';
import { JSONAPIPaginationQueryParams } from '../../decorators/json-api-parameters.decorator';
import { SetScenarioIdsInterceptor } from './set-scenario-ids.interceptor';
import { GetImpactTableDto } from './dto/impact-table.dto';
import { ImpactReportService } from './impact.report';

@Controller('/api/v1/impact')
export class ImpactReportController {
  constructor(
    private readonly impactService: ImpactService,
    private readonly impactReports: ImpactReportService,
    private readonly actualVsScenarioImpactService: ActualVsScenarioImpactService,
    private readonly scenarioVsScenarioService: ScenarioVsScenarioImpactService,
  ) {}

  @ApiOperation({
    description: 'Get a Impact Table CSV Report',
  })
  @JSONAPIPaginationQueryParams()
  @UseInterceptors(SetScenarioIdsInterceptor)
  @Get('table/report')
  async getImpactTable(
    @Query(ValidationPipe) impactTableDto: GetImpactTableDto,
  ): Promise<string> {
    const table: any = await this.impactService.getImpactTable(impactTableDto, {
      disablePagination: true,
    });
    return this.impactReports.generateImpactReport(table);
  }
}

import {
  Controller,
  Get,
  Query,
  Res,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ImpactService } from 'modules/impact/impact.service';
import { ActualVsScenarioImpactService } from 'modules/impact/comparison/actual-vs-scenario.service';
import { ScenarioVsScenarioImpactService } from 'modules/impact/comparison/scenario-vs-scenario.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SetScenarioIdsInterceptor } from 'modules/impact/set-scenario-ids.interceptor';
import { ImpactReportService } from 'modules/impact/reports/impact.report';
import { Response } from 'express';
import { GetImpactTableDto } from 'modules/impact/dto/impact-table.dto';

@Controller('/api/v1/impact')
@ApiTags('Impact')
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
  @UseInterceptors(SetScenarioIdsInterceptor)
  @Get('table/report')
  async getImpactTable(
    @Query(ValidationPipe) impactTableDto: GetImpactTableDto,
    @Res() res: Response,
  ): Promise<void> {
    const { data } = await this.impactService.getImpactTable(impactTableDto, {
      disablePagination: true,
    });
    const report: string = await this.impactReports.generateImpactReport(
      data.impactTable,
    );
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=impact_report.csv',
    );
    res.send(report);
  }
}

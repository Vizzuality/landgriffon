import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { GetImpactTableDto } from 'modules/impact/dto/get-impact-table.dto';
import { ImpactService, ImpactTable } from 'modules/impact/impact.service';

@Controller('/api/v1/impact')
export class ImpactController {
  constructor(public readonly impactService: ImpactService) {}

  @Get('table')
  async getImpactTable(
    @Query(ValidationPipe) impactTableDto: GetImpactTableDto,
  ): Promise<{ data: ImpactTable }> {
    const impactTable: ImpactTable = await this.impactService.getImpactTable(
      impactTableDto,
    );
    return { data: impactTable };
  }
}

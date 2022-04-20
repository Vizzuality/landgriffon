import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { GetImpactTableDto } from 'modules/impact/dto/get-impact-table.dto';
import { ImpactService } from 'modules/impact/impact.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ImpactTable,
  PaginatedImpactTable,
} from 'modules/impact/dto/response-impact-table.dto';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';

@Controller('/api/v1/impact')
@ApiTags('Impact')
export class ImpactController {
  constructor(private readonly impactService: ImpactService) {}

  @ApiOperation({
    description: 'Get data for Impact Table',
  })
  @ApiOkResponse({
    type: ImpactTable,
  })
  @Get('table')
  async getImpactTable(
    @ProcessFetchSpecification({}) fetchSpecification: FetchSpecification,
    @Query(ValidationPipe) impactTableDto: GetImpactTableDto,
  ): Promise<PaginatedImpactTable> {
    return await this.impactService.getImpactTable(
      impactTableDto,
      fetchSpecification,
    );
  }
}

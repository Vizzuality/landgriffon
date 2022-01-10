import {
  Controller,
  Get,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { GetImpactTableDto } from 'modules/impact/dto/get-impact-table.dto';
import { ImpactService } from 'modules/impact/impact.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ImpactTable } from 'modules/impact/dto/response-impact-table.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('/api/v1/impact')
@UseGuards(JwtAuthGuard)
@ApiTags('Impact')
export class ImpactController {
  constructor(public readonly impactService: ImpactService) {}

  @ApiOperation({
    description: 'Get data for Impact Table',
  })
  @ApiOkResponse({
    type: ImpactTable,
  })
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

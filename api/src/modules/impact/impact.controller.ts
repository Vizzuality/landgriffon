import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { GetImpactTableDto } from 'modules/impact/dto/get-impact-table.dto';
import { ImpactService } from 'modules/impact/impact.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ImpactTable } from 'modules/impact/dto/response-impact-table.dto';
import { ParseOptionalIntPipe } from 'pipes/parse-optional-int.pipe';
import { Material } from 'modules/materials/material.entity';
import { MaterialsService } from 'modules/materials/materials.service';

@Controller('/api/v1/impact')
@ApiTags('Impact')
export class ImpactController {
  constructor(
    public readonly impactService: ImpactService,
    public readonly materialsService: MaterialsService,
  ) {}

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

  @ApiOperation({ description: 'Return materials imported by a User' })
  @ApiOkResponse({
    type: Material,
    isArray: true,
  })
  @Get('materials')
  async getMaterialsForImpact(
    @Query('depth', ParseOptionalIntPipe) depth?: number,
  ): Promise<Material[]> {
    const results: Material[] =
      await this.materialsService.getMaterialsForImpact();
    //return this.materialsService.serialize(results);
    return results;
  }
}

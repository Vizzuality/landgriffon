import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { GetImpactTableDto } from 'modules/impact/dto/get-impact-table.dto';
import { ImpactService } from 'modules/impact/impact.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ImpactTable } from 'modules/impact/dto/response-impact-table.dto';
import { Material } from 'modules/materials/material.entity';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';

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
    @Query(ValidationPipe) impactTableDto: GetImpactTableDto,
  ): Promise<{ data: ImpactTable }> {
    const impactTable: ImpactTable = await this.impactService.getImpactTable(
      impactTableDto,
    );
    return { data: impactTable };
  }

  @ApiOperation({ description: 'Return materials loaded by a user' })
  @ApiOkResponse({
    type: Material,
    isArray: true,
  })
  @Get('materials')
  async getMaterialTreeForImpact(): Promise<Material[]> {
    return this.impactService.getMaterialTreeForImpact();
  }

  @ApiOperation({
    description:
      'Return admin-regions where a user has sourcing-locations within',
  })
  @ApiOkResponse({
    type: AdminRegion,
    isArray: true,
  })
  @Get('admin-regions')
  async getAdminRegionTreeForImpact(): Promise<AdminRegion[]> {
    return this.impactService.getAdminRegionTreeForImpact();
  }
  @ApiOperation({ description: 'Return suppliers loaded by a user' })
  @ApiOkResponse({
    type: Supplier,
    isArray: true,
  })
  @Get('suppliers')
  async getSupplierTreeForImpact(): Promise<AdminRegion[]> {
    return this.impactService.getSupplierTreeForImpact();
  }
}

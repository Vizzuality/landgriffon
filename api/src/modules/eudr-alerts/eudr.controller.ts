import {
  Controller,
  Get,
  Query,
  Res,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { Writable } from 'stream';
import { ApiOkTreeResponse } from 'decorators/api-tree-response.decorator';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { SetScenarioIdsInterceptor } from 'modules/impact/set-scenario-ids.interceptor';
import { GetSupplierEUDR } from 'modules/suppliers/dto/get-supplier-by-type.dto';
import { SuppliersService } from 'modules/suppliers/suppliers.service';
import { MaterialsService } from 'modules/materials/materials.service';
import { GeoRegionsService } from 'modules/geo-regions/geo-regions.service';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';
import { Material } from 'modules/materials/material.entity';
import { GetEUDRMaterials } from 'modules/materials/dto/get-material-tree-with-options.dto';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { GetEUDRAdminRegions } from 'modules/admin-regions/dto/get-admin-region-tree-with-options.dto';
import {
  GeoRegion,
  geoRegionResource,
} from 'modules/geo-regions/geo-region.entity';
import { JSONAPIQueryParams } from 'decorators/json-api-parameters.decorator';
import { GetEUDRGeoRegions } from 'modules/geo-regions/dto/get-geo-region.dto';
import { AlertsOutput } from 'modules/eudr-alerts/dto/alerts-output.dto';
import { EudrService } from 'modules/eudr-alerts/eudr.service';
import { ResourceStream } from '@google-cloud/paginator';
import { GetEUDRALertsDto } from './dto/get-alerts.dto';

@Controller('/api/v1/eudr')
export class EudrController {
  constructor(
    private readonly eudrAlertsService: EudrService,
    private readonly suppliersService: SuppliersService,
    private readonly materialsService: MaterialsService,
    private readonly geoRegionsService: GeoRegionsService,
    private readonly adminRegionsService: AdminRegionsService,
  ) {}

  @ApiOperation({
    description:
      'Find all EUDR suppliers and return them in a flat format. Data in the "children" will recursively extend for the full depth of the tree',
  })
  @ApiOkTreeResponse({
    treeNodeType: Supplier,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @UseInterceptors(SetScenarioIdsInterceptor)
  @Get('/suppliers')
  async getSuppliers(
    @Query(ValidationPipe) dto: GetSupplierEUDR,
  ): Promise<Supplier> {
    const results: Supplier[] = await this.suppliersService.getSupplierByType({
      ...dto,
      eudr: true,
    });
    return this.suppliersService.serialize(results);
  }

  @ApiOperation({
    description:
      'Find all EUDR materials and return them in a tree format. Data in the "children" will recursively extend for the full depth of the tree',
  })
  @ApiOkTreeResponse({
    treeNodeType: Material,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Get('/materials')
  async getMaterialsTree(
    @Query(ValidationPipe) materialTreeOptions: GetEUDRMaterials,
  ): Promise<Material> {
    const results: Material[] = await this.materialsService.getTrees({
      ...materialTreeOptions,
      withSourcingLocations: true,
      eudr: true,
    });
    return this.materialsService.serialize(results);
  }

  @ApiOperation({
    description:
      'Find all EUDR admin regions and return them in a tree format. Data in the "children" will recursively extend for the full depth of the tree',
  })
  @ApiOkTreeResponse({
    treeNodeType: AdminRegion,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @UseInterceptors(SetScenarioIdsInterceptor)
  @Get('/admin-regions')
  async getTreesForEudr(
    @Query(ValidationPipe)
    adminRegionTreeOptions: GetEUDRAdminRegions,
  ): Promise<AdminRegion[]> {
    const results: AdminRegion[] = await this.adminRegionsService.getTrees({
      ...adminRegionTreeOptions,
      withSourcingLocations: true,
      eudr: true,
    });
    return this.adminRegionsService.serialize(results);
  }

  @ApiOperation({
    description: 'Find all EUDR geo regions',
  })
  @ApiOkResponse({
    type: GeoRegion,
    isArray: true,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams({
    availableFilters: geoRegionResource.columnsAllowedAsFilter.map(
      (columnName: string) => ({
        name: columnName,
      }),
    ),
  })
  @Get('/geo-regions')
  async findAllEudr(
    @Query(ValidationPipe)
    dto: GetEUDRGeoRegions,
  ): Promise<GeoRegion[]> {
    const results: GeoRegion[] =
      await this.geoRegionsService.getGeoRegionsFromSourcingLocations({
        ...dto,
        withSourcingLocations: true,
        eudr: true,
      });
    return this.geoRegionsService.serialize(results);
  }

  @Get('/alerts')
  async getAlerts(
    @Res() response: Response,
    dto: GetEUDRALertsDto,
  ): Promise<any> {
    const stream: ResourceStream<AlertsOutput> =
      this.eudrAlertsService.getAlerts();
    this.streamResponse(response, stream);
  }

  streamResponse(response: Response, stream: Writable): any {
    stream.on('data', (data: any) => {
      const json: string = JSON.stringify(data);
      response.write(json + '\n');
    });

    stream.on('end', () => {
      response.end();
    });

    stream.on('error', (error: any) => {
      console.error('Stream error:', error);
      response.status(500).send('Error processing stream');
    });
  }
}

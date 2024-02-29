import {
  Controller,
  Get,
  Query,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { Public } from 'decorators/public.decorator';
import { CartoConnector } from 'modules/eudr/carto/carto.connector';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiOkTreeResponse } from '../../decorators/api-tree-response.decorator';
import { Supplier } from '../suppliers/supplier.entity';
import { SetScenarioIdsInterceptor } from '../impact/set-scenario-ids.interceptor';
import { GetSupplierEUDR } from '../suppliers/dto/get-supplier-by-type.dto';
import { SuppliersService } from '../suppliers/suppliers.service';
import { MaterialsService } from 'modules/materials/materials.service';
import { GeoRegionsService } from 'modules/geo-regions/geo-regions.service';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';
import { Material } from '../materials/material.entity';
import { GetEUDRMaterials } from '../materials/dto/get-material-tree-with-options.dto';
import { AdminRegion } from '../admin-regions/admin-region.entity';
import { GetEUDRAdminRegions } from '../admin-regions/dto/get-admin-region-tree-with-options.dto';
import { GeoRegion, geoRegionResource } from '../geo-regions/geo-region.entity';
import { JSONAPIQueryParams } from '../../decorators/json-api-parameters.decorator';
import { GetEUDRGeoRegions } from '../geo-regions/dto/get-geo-region.dto';

@Controller('/api/v1/eudr')
export class EudrController {
  constructor(
    private readonly carto: CartoConnector,
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
  @Get('/eudr')
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

  @Public()
  @Get('test')
  async select(): Promise<any> {
    return this.carto.select('select * from cartobq.eudr.mock_data limit 10');
  }
}

import {
  Controller,
  Get,
  Param,
  Query,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiPropertyOptional,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

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
import { EudrService } from 'modules/eudr-alerts/eudr.service';
import {
  GetEUDRAlertDatesDto,
  GetEUDRAlertsDto,
} from 'modules/eudr-alerts/dto/get-alerts.dto';
import { EUDRAlertDates } from 'modules/eudr-alerts/eudr.repositoty.interface';
import { GetEUDRFeaturesGeoJSONDto } from 'modules/geo-regions/dto/get-features-geojson.dto';
import {
  GeoFeatureCollectionResponse,
  GeoFeatureResponse,
} from 'modules/geo-regions/dto/geo-feature-response.dto';
import { EudrDashboardService } from './dashboard/eudr-dashboard.service';
import { IsDate, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { EUDRDashboard } from './dashboard/dashboard.types';
import { EUDRDashBoardDetail } from './dashboard/dashboard-detail.types';

export class GetDashBoardDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startAlertDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endAlertDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4', { each: true })
  producerIds: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4', { each: true })
  materialIds: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4', { each: true })
  originIds: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4', { each: true })
  geoRegionIds: string[];
}

@ApiTags('EUDR')
@Controller('/api/v1/eudr')
export class EudrController {
  constructor(
    private readonly eudrAlertsService: EudrService,
    private readonly dashboard: EudrDashboardService,
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

  @ApiOperation({
    description: 'Get EUDR alerts dates',
  })
  @ApiOkResponse({
    type: EUDRAlertDates,
    isArray: true,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Get('/dates')
  async getAlertDates(
    @Query(ValidationPipe) dto: GetEUDRAlertsDto,
  ): Promise<{ data: EUDRAlertDates[] }> {
    const dates: EUDRAlertDates[] = await this.eudrAlertsService.getDates(dto);
    return {
      data: dates,
    };
  }

  @Get('/alerts')
  async getAlerts(@Query(ValidationPipe) dto: GetEUDRAlertsDto): Promise<any> {
    return this.eudrAlertsService.getAlerts(dto);
  }

  @ApiOperation({
    description: 'Get a Feature List GeoRegion Ids',
  })
  @ApiOkResponse({ type: GeoFeatureResponse, isArray: true })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Get('/geo-features')
  async getGeoFeatureList(
    @Query(ValidationPipe) dto: GetEUDRFeaturesGeoJSONDto,
  ): Promise<GeoFeatureResponse[]> {
    if (dto.originIds) {
      dto.originIds = await this.adminRegionsService.getAdminRegionDescendants(
        dto.originIds,
      );
    }
    if (dto.materialIds) {
      dto.materialIds = await this.materialsService.getMaterialsDescendants(
        dto.materialIds,
      );
    }
    return this.geoRegionsService.getGeoJson({ ...dto, eudr: true });
  }

  @ApiOperation({
    description: 'Get a Feature Collection by GeoRegion Ids',
  })
  @ApiOkResponse({ type: GeoFeatureCollectionResponse })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Get('/geo-features/collection')
  async getGeoFeatureCollection(
    @Query(ValidationPipe) dto: GetEUDRFeaturesGeoJSONDto,
  ): Promise<GeoFeatureCollectionResponse> {
    if (dto.originIds) {
      dto.originIds = await this.adminRegionsService.getAdminRegionDescendants(
        dto.originIds,
      );
    }
    if (dto.materialIds) {
      dto.materialIds = await this.materialsService.getMaterialsDescendants(
        dto.materialIds,
      );
    }
    return this.geoRegionsService.getGeoJson({
      ...dto,
      eudr: true,
      collection: true,
    });
  }

  @ApiOperation({ description: 'Get EUDR Dashboard' })
  @ApiOkResponse({ type: EUDRDashboard })
  @Get('/dashboard')
  async getDashboard(
    @Query(ValidationPipe) dto: GetDashBoardDTO,
  ): Promise<EUDRDashboard> {
    return this.dashboard.buildDashboard(dto);
  }

  @ApiOperation({ description: 'Get EUDR Dashboard Detail' })
  @ApiOkResponse({ type: EUDRDashBoardDetail })
  @Get('/dashboard/detail/:supplierId')
  async getDashboardDetail(
    @Param('supplierId') supplierId: string,
    @Query(ValidationPipe) dto: GetEUDRAlertDatesDto,
  ): Promise<EUDRDashBoardDetail> {
    return this.dashboard.buildDashboardDetail(supplierId, dto);
  }
}

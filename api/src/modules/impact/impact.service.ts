import { Injectable, Logger } from '@nestjs/common';
import { GetImpactTableDto } from 'modules/impact/dto/get-impact-table.dto';
import { IndicatorsService } from 'modules/indicators/indicators.service';
import { SourcingRecordsService } from 'modules/sourcing-records/sourcing-records.service';
import { ImpactTableData } from 'modules/sourcing-records/sourcing-record.repository';
import { Indicator } from 'modules/indicators/indicator.entity';
import { range } from 'lodash';
import {
  ImpactTable,
  ImpactTableDataByIndicator,
  ImpactTablePurchasedTonnes,
  ImpactTableRows,
  ImpactTableRowsValues,
  PaginatedImpactTable,
} from 'modules/impact/dto/response-impact-table.dto';
import { BusinessUnitsService } from 'modules/business-units/business-units.service';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';
import { SuppliersService } from 'modules/suppliers/suppliers.service';
import { MaterialsService } from 'modules/materials/materials.service';
import { GROUP_BY_VALUES } from 'modules/h3-data/dto/get-impact-map.dto';
import { ImpactTableEntityType } from 'types/impact-table-entity.type';
import { DEFAULT_PAGINATION, FetchSpecification } from 'nestjs-base-service';
import { PaginationMeta } from 'utils/app-base.service';
import { PaginatedEntitiesDto } from 'modules/impact/dto/paginated-entities.dto';

@Injectable()
export class ImpactService {
  //TODO: Hack to set a expected growing rate. This needs to be stored in the DB in the future
  growthRate: number = 1.5;
  logger: Logger = new Logger(ImpactService.name);

  constructor(
    private readonly indicatorService: IndicatorsService,
    private readonly businessUnitsService: BusinessUnitsService,
    private readonly adminRegionsService: AdminRegionsService,
    private readonly suppliersService: SuppliersService,
    private readonly materialsService: MaterialsService,
    private readonly sourcingRecordService: SourcingRecordsService,
  ) {}

  async getImpactTable(
    impactTableDto: GetImpactTableDto,
    fetchSpecification: FetchSpecification,
  ): Promise<PaginatedImpactTable> {
    const indicators: Indicator[] =
      await this.indicatorService.getIndicatorsById(
        impactTableDto.indicatorIds,
      );
    this.logger.log('Retrieving data from DB to build Impact Table...');
    let entitiesWithPagination: PaginatedEntitiesDto = {
      entities: [],
      metadata: undefined,
    };
    /*
     * Getting Descendants Ids for the filters, in case Parent Ids were received
     */

    if (impactTableDto.originIds)
      impactTableDto.originIds =
        await this.adminRegionsService.getAdminRegionDescendants(
          impactTableDto.originIds,
        );
    if (impactTableDto.materialIds)
      impactTableDto.materialIds =
        await this.materialsService.getMaterialsDescendants(
          impactTableDto.materialIds,
        );
    if (impactTableDto.supplierIds)
      impactTableDto.supplierIds =
        await this.suppliersService.getSuppliersDescendants(
          impactTableDto.supplierIds,
        );

    /*
     * Get full entity tree in cate ids are not passed,
     * otherwise get trees based on given ids and add children and parent
     * ids to them to get full data for aggregations
     */

    // TODO check if tree ids search is redundant

    switch (impactTableDto.groupBy) {
      case GROUP_BY_VALUES.MATERIAL:
        if (impactTableDto.materialIds) {
          entitiesWithPagination.entities =
            await this.materialsService.getMaterialsTreeWithSourcingLocations({
              materialIds: impactTableDto.materialIds,
            });
        } else {
          entitiesWithPagination.entities =
            await this.materialsService.getMaterialsTreeWithSourcingLocations(
              {},
            );
        }
        entitiesWithPagination = ImpactService.paginateRootElements(
          entitiesWithPagination.entities,
          fetchSpecification,
        );

        /*
         * Filter out ids to only include descendants of
         * paginated root elements
         */
        const materialIds: string[] = this.getIdsFromTree(
          entitiesWithPagination.entities,
        );
        impactTableDto.materialIds = impactTableDto.materialIds
          ? impactTableDto.materialIds.filter((value: string) =>
              materialIds.includes(value),
            )
          : materialIds;
        break;
      case GROUP_BY_VALUES.REGION:
        if (impactTableDto.originIds) {
          entitiesWithPagination.entities =
            await this.adminRegionsService.getAdminRegionTreeWithSourcingLocations(
              { originIds: impactTableDto.originIds },
            );
        } else {
          entitiesWithPagination.entities =
            await this.adminRegionsService.getAdminRegionTreeWithSourcingLocations(
              {},
            );
        }
        entitiesWithPagination = ImpactService.paginateRootElements(
          entitiesWithPagination.entities,
          fetchSpecification,
        );
        const originIds: string[] = this.getIdsFromTree(
          entitiesWithPagination.entities,
        );
        impactTableDto.originIds = impactTableDto.originIds
          ? impactTableDto.originIds.filter((value: string) =>
              originIds.includes(value),
            )
          : originIds;
        break;
      case GROUP_BY_VALUES.SUPPLIER:
        if (impactTableDto.supplierIds) {
          entitiesWithPagination.entities =
            await this.suppliersService.getSuppliersWithSourcingLocations({
              supplierIds: impactTableDto.supplierIds,
            });
        } else {
          entitiesWithPagination.entities =
            await this.suppliersService.getSuppliersWithSourcingLocations({});
        }
        entitiesWithPagination = ImpactService.paginateRootElements(
          entitiesWithPagination.entities,
          fetchSpecification,
        );
        impactTableDto.supplierIds = this.getIdsFromTree(
          entitiesWithPagination.entities,
        );
        const supplierIds: string[] = this.getIdsFromTree(
          entitiesWithPagination.entities,
        );
        impactTableDto.supplierIds = impactTableDto.supplierIds
          ? impactTableDto.supplierIds.filter((value: string) =>
              supplierIds.includes(value),
            )
          : supplierIds;
        break;
      case GROUP_BY_VALUES.BUSINESS_UNIT:
        entitiesWithPagination.entities =
          await this.businessUnitsService.getBusinessUnitTreeWithSourcingLocations(
            {},
          );
        entitiesWithPagination = ImpactService.paginateRootElements(
          entitiesWithPagination.entities,
          fetchSpecification,
        );
        break;
      default:
    }

    // Check if any ids are left after pagination, not to pass empty array
    const dataForImpactTable: ImpactTableData[] =
      entitiesWithPagination.entities.length > 0
        ? await this.sourcingRecordService.getDataForImpactTable(impactTableDto)
        : [];
    const impactTable: ImpactTable = this.buildImpactTable(
      impactTableDto,
      indicators,
      dataForImpactTable,
      this.buildImpactTableRowsSkeleton(entitiesWithPagination.entities),
    );
    return { data: impactTable, metadata: entitiesWithPagination.metadata };
  }

  private buildImpactTable(
    queryDto: GetImpactTableDto,
    indicators: Indicator[],
    dataForImpactTable: ImpactTableData[],
    entities: ImpactTableRows[],
  ): ImpactTable {
    this.logger.log('Building Impact Table...');
    const { groupBy, startYear, endYear } = queryDto;
    const impactTable: ImpactTableDataByIndicator[] = [];
    // Create a range of years by start and endYears
    const rangeOfYears: number[] = range(startYear, endYear + 1);
    // Append data by indicator and add its unit.symbol as metadata. We need awareness of this loop during the whole process
    indicators.forEach((indicator: Indicator, indicatorValuesIndex: number) => {
      const calculatedData: ImpactTableRows[] = [];
      impactTable.push({
        indicatorShortName: indicator.shortName as string,
        indicatorId: indicator.id,
        groupBy: groupBy,
        rows: [],
        yearSum: [],
        metadata: { unit: indicator.unit.symbol },
      });
      // Filter the raw data by Indicator
      const dataByIndicator: ImpactTableData[] = dataForImpactTable.filter(
        (data: ImpactTableData) => data.indicatorId === indicator.id,
      );
      // Get unique entity names for aggregations from raw data
      const namesByIndicator: string[] = [
        ...new Set(dataByIndicator.map((el: ImpactTableData) => el.name)),
      ];
      // For each unique name, append values by year
      for (const [namesByIndicatorIndex, name] of namesByIndicator.entries()) {
        calculatedData.push({
          name,
          values: [],
          children: [],
        });
        let rowValuesIndex: number = 0;
        for (const year of rangeOfYears) {
          const dataForYear: ImpactTableData | undefined = dataByIndicator.find(
            (data: ImpactTableData) => data.year === year && data.name === name,
          );
          //If the year requested by the users exist in the raw data, append its value. There will always be a first valid value to start with
          if (dataForYear) {
            calculatedData[namesByIndicatorIndex].values.push({
              year: dataForYear.year,
              value: dataForYear.impact,
              isProjected: false,
            });
            // If the year requested does no exist in the raw data, project its value getting the latest value (previous year which comes in ascendant order)
          } else {
            const lastYearsValue: number =
              calculatedData[namesByIndicatorIndex].values[rowValuesIndex - 1]
                .value;
            calculatedData[namesByIndicatorIndex].values.push({
              year: year,
              value: lastYearsValue + (lastYearsValue * this.growthRate) / 100,
              isProjected: true,
            });
          }
          ++rowValuesIndex;
        }
      }
      // Once we have all data, projected or not, append the total sum of impact by year and indicator
      rangeOfYears.forEach((year: number, indexOfYear: number) => {
        const totalSumByYear: number = calculatedData.reduce(
          (accumulator: number, currentValue: ImpactTableRows): number => {
            if (currentValue.values[indexOfYear].year === year)
              accumulator += Number.isFinite(
                currentValue.values[indexOfYear].value,
              )
                ? currentValue.values[indexOfYear].value
                : 0;
            return accumulator;
          },
          0,
        );
        impactTable[indicatorValuesIndex].yearSum.push({
          year,
          value: totalSumByYear,
        });
      });
      // copy and populate tree skeleton for each indicator
      const skeleton: ImpactTableRows[] = JSON.parse(JSON.stringify(entities));
      skeleton.forEach((entity: any) => {
        this.populateValuesRecursively(entity, calculatedData, rangeOfYears);
      });
      impactTable[indicatorValuesIndex].rows = skeleton.filter(
        (item: ImpactTableRows) =>
          item.children.length > 0 || item.values[0].value > 0,
      );
    });
    const purchasedTonnes: ImpactTablePurchasedTonnes[] =
      this.getTotalPurchasedVolumeByYear(rangeOfYears, dataForImpactTable);
    this.logger.log('Impact Table built');

    return { impactTable, purchasedTonnes };
  }

  private getTotalPurchasedVolumeByYear(
    rangeOfYears: number[],
    dataForImpactTable: ImpactTableData[],
  ): ImpactTablePurchasedTonnes[] {
    const purchasedTonnes: ImpactTablePurchasedTonnes[] = [];
    rangeOfYears.forEach((year: number) => {
      const valueOfPurchasedTonnesByYear: number = dataForImpactTable.reduce(
        (accumulator: number, currentValue: ImpactTableData): number => {
          if (currentValue.year === year) {
            accumulator += Number.isFinite(+currentValue.impact)
              ? +currentValue.impact
              : 0;
          }
          return accumulator;
        },
        0,
      );
      // If value exist for that year, append it. There will always be a first valid value to start with
      if (valueOfPurchasedTonnesByYear) {
        purchasedTonnes.push({
          year,
          value: valueOfPurchasedTonnesByYear,
          isProjected: false,
        });
        // If it does not exist, get the previous value and project it
      } else {
        const tonnesToProject: number =
          dataForImpactTable.length > 0
            ? dataForImpactTable[dataForImpactTable.length - 1].impact
            : 0;
        purchasedTonnes.push({
          year,
          value: tonnesToProject + (tonnesToProject * this.growthRate) / 100,
          isProjected: true,
        });
      }
    });
    return purchasedTonnes;
  }

  /**
   * @description Retrieve base estimates for all indicators
   */
  async getEstimates(): Promise<any> {}

  /**
   * @description Recursive function that populates and returns
   * aggregated data of parent entity and all its children
   */
  private populateValuesRecursively(
    entity: ImpactTableRows,
    calculatedRows: ImpactTableRows[],
    rangeOfYears: number[],
  ): ImpactTableRowsValues[] {
    entity.values = [];
    for (const year of rangeOfYears) {
      entity.values.push({
        year: year,
        value: 0,
        isProjected: false,
      });
    }

    const valuesToAggregate: ImpactTableRowsValues[][] = [];
    const selfData: ImpactTableRows | undefined = calculatedRows.find(
      (item: ImpactTableRows) => item.name === entity.name,
    );
    if (selfData) valuesToAggregate.push(selfData.values);
    entity.children.forEach((childEntity: ImpactTableRows) => {
      valuesToAggregate.push(
        /*
         * first aggregate data of child entity and then add returned value for
         * parents aggregation
         */
        this.populateValuesRecursively(
          childEntity,
          calculatedRows,
          rangeOfYears,
        ),
      );
    });
    for (const [valueIndex, ImpactTableRowsValues] of entity.values.entries()) {
      valuesToAggregate.forEach((item: ImpactTableRowsValues[]) => {
        entity.values[valueIndex].value =
          ImpactTableRowsValues.value + item[valueIndex].value;
        entity.values[valueIndex].isProjected =
          item[valueIndex].isProjected || entity.values[valueIndex].isProjected;
      });
    }
    return entity.values;
  }

  private buildImpactTableRowsSkeleton(
    entities: ImpactTableEntityType[],
  ): ImpactTableRows[] {
    return entities.map((item: ImpactTableEntityType) => {
      return {
        name: item.name || '',
        children:
          item.children.length > 0
            ? this.buildImpactTableRowsSkeleton(item.children)
            : [],
        values: [],
      };
    });
  }

  private getIdsFromTree(entities: ImpactTableEntityType[]): string[] {
    return entities.reduce((ids: string[], entity: ImpactTableEntityType) => {
      const childIds: string[] =
        entity.children.length > 0 ? this.getIdsFromTree(entity.children) : [];
      return [...ids, ...childIds, entity.id];
    }, []);
  }

  private static paginateRootElements(
    entities: ImpactTableEntityType[],
    fetchSpecification: FetchSpecification,
  ): PaginatedEntitiesDto {
    if (fetchSpecification.disablePagination) {
      return {
        entities,
        metadata: undefined,
      };
    }
    const totalItems: number = entities.length;
    const pageSize: number =
      fetchSpecification?.pageSize ?? DEFAULT_PAGINATION.pageSize ?? 25;
    const page: number =
      fetchSpecification?.pageNumber ?? DEFAULT_PAGINATION.pageNumber ?? 1;
    return {
      entities: entities.slice((page - 1) * pageSize, page * pageSize),
      metadata: new PaginationMeta({
        totalPages: Math.ceil(totalItems / pageSize),
        totalItems,
        size: pageSize,
        page,
      }),
    };
  }
}

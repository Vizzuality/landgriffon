import { Injectable, Logger } from '@nestjs/common';
import {
  AnyImpactTableDto,
  GetActualVsScenarioImpactTableDto,
  GetImpactTableDto,
  GetRankedImpactTableDto,
  GROUP_BY_VALUES,
} from 'modules/impact/dto/impact-table.dto';
import { IndicatorsService } from 'modules/indicators/indicators.service';
import { SourcingRecordsService } from 'modules/sourcing-records/sourcing-records.service';
import {
  ActualVsScenarioImpactTableData,
  AnyImpactTableData,
  ImpactTableData,
} from 'modules/sourcing-records/sourcing-record.repository';
import {
  AnyImpactTableRowsValues,
  ImpactTablePurchasedTonnes,
} from 'modules/impact/dto/response-impact-table.dto';
import { BusinessUnitsService } from 'modules/business-units/business-units.service';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';
import { SuppliersService } from 'modules/suppliers/suppliers.service';
import { MaterialsService } from 'modules/materials/materials.service';
import { ImpactTableEntityType } from 'types/impact-table-entity.type';
import { DEFAULT_PAGINATION, FetchSpecification } from 'nestjs-base-service';
import { PaginatedEntitiesDto } from 'modules/impact/dto/paginated-entities.dto';
import { LOCATION_TYPES } from 'modules/sourcing-locations/sourcing-location.entity';
import { PaginationMeta } from 'utils/app-base.service';
import { SourcingLocationsService } from 'modules/sourcing-locations/sourcing-locations.service';
import { CommonFiltersDto } from 'utils/base.query-builder';
import { SUPPLIER_TYPES } from 'modules/suppliers/supplier.entity';

@Injectable()
export class BaseImpactService {
  //TODO: Hack to set a expected growing rate. This needs to be stored in the DB in the future
  protected growthRate: number = 1.5;
  logger: Logger = new Logger(BaseImpactService.name);

  constructor(
    protected readonly indicatorService: IndicatorsService,
    protected readonly businessUnitsService: BusinessUnitsService,
    protected readonly adminRegionsService: AdminRegionsService,
    protected readonly suppliersService: SuppliersService,
    protected readonly materialsService: MaterialsService,
    protected readonly sourcingRecordService: SourcingRecordsService,
    protected readonly sourcingLocationsService: SourcingLocationsService,
  ) {}

  /**
   * Modifies the ImpactTabledto such that, for each entityIds that is populated,
   * the ids of their descendants are added, in-place. Suppliers are not included in this
   * because we serve them in a flat structure, so there is no need to search for descendants
   * @param impactTableDto
   * @protected
   */
  protected async loadDescendantEntityIds(
    impactTableDto: GetImpactTableDto,
  ): Promise<GetImpactTableDto> {
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
    if (impactTableDto.businessUnitIds)
      impactTableDto.businessUnitIds =
        await this.businessUnitsService.getBusinessUnitsDescendants(
          impactTableDto.businessUnitIds,
        );

    return impactTableDto;
  }

  /**
   * @description Returns an array of ImpactTable Entities, determined by the groupBy field and properties
   * of the GetImpactTableDto
   * @param impactTableDto
   * @protected
   */
  protected async getEntityTree(
    impactTableDto: AnyImpactTableDto,
  ): Promise<ImpactTableEntityType[]> {
    const treeOptions: CommonFiltersDto = {
      ...(impactTableDto.materialIds && {
        materialIds: impactTableDto.materialIds,
      }),
      ...(impactTableDto.originIds && {
        originIds: impactTableDto.originIds,
      }),
      ...(impactTableDto.t1SupplierIds && {
        t1SupplierIds: impactTableDto.t1SupplierIds,
      }),
      ...(impactTableDto.producerIds && {
        producerIds: impactTableDto.producerIds,
      }),
      ...(impactTableDto.businessUnitIds && {
        businessUnitIds: impactTableDto.businessUnitIds,
      }),
      ...(impactTableDto.scenarioIds && {
        scenarioIds: impactTableDto.scenarioIds,
      }),
      ...(impactTableDto.locationTypes && {
        locationTypes: impactTableDto.locationTypes,
      }),
    };

    switch (impactTableDto.groupBy) {
      case GROUP_BY_VALUES.MATERIAL: {
        return this.materialsService.getMaterialsTreeFromSourcingLocations(
          treeOptions,
        );
      }
      case GROUP_BY_VALUES.REGION: {
        return this.adminRegionsService.getAdminRegionWithSourcingLocations(
          treeOptions,
        );
      }
      case GROUP_BY_VALUES.T1_SUPPLIER: {
        return this.suppliersService.getSuppliersTreeWithSourcingLocations(
          {
            ...treeOptions,
            type: SUPPLIER_TYPES.T1SUPPLIER,
          },
          false,
        );
      }
      case GROUP_BY_VALUES.PRODUCER: {
        return this.suppliersService.getSuppliersTreeWithSourcingLocations(
          {
            ...treeOptions,
            type: SUPPLIER_TYPES.PRODUCER,
          },
          false,
        );
      }
      case GROUP_BY_VALUES.BUSINESS_UNIT:
        return this.businessUnitsService.getBusinessUnitWithSourcingLocations(
          treeOptions,
        );

      case GROUP_BY_VALUES.LOCATION_TYPE:
        return (
          await this.sourcingLocationsService.getAvailableLocationTypes(
            treeOptions,
          )
        ).map((entity: LOCATION_TYPES) => {
          return { name: entity, children: [] };
        });

      default:
        return [];
    }
  }

  /**
   * Modifies the impactTableDto in-place, to put the ids of the entity tree into the
   * corresponding entity Ids field according to the groupBy
   * @param impactTableDto
   * @param entities
   * @protected
   */
  protected updateGroupByCriteriaFromEntityTree(
    impactTableDto: AnyImpactTableDto,
    entities: ImpactTableEntityType[],
  ): void {
    switch (impactTableDto.groupBy) {
      case GROUP_BY_VALUES.MATERIAL:
        impactTableDto.materialIds = BaseImpactService.getIdsFromTree(
          entities,
          impactTableDto.materialIds,
        );
        break;
      case GROUP_BY_VALUES.REGION:
        impactTableDto.originIds = BaseImpactService.getIdsFromTree(
          entities,
          impactTableDto.originIds,
        );
        break;

      case GROUP_BY_VALUES.BUSINESS_UNIT:
        impactTableDto.businessUnitIds = BaseImpactService.getIdsFromTree(
          entities,
          impactTableDto.businessUnitIds,
        );
        break;

      default:
    }
  }

  protected getDataForImpactTable(
    impactTableDto: AnyImpactTableDto,
    entities: ImpactTableEntityType[],
  ): Promise<ImpactTableData[]> {
    if (entities.length) {
      if (
        impactTableDto instanceof GetImpactTableDto ||
        impactTableDto instanceof GetRankedImpactTableDto
      ) {
        return this.sourcingRecordService.getDataForImpactTable(impactTableDto);
      } else if (impactTableDto instanceof GetActualVsScenarioImpactTableDto) {
        return this.sourcingRecordService.getDataForActualVsScenarioImpactTable(
          impactTableDto,
        );
      } else {
        return this.sourcingRecordService.getDataForActualVsScenarioImpactTable(
          impactTableDto,
        );
      }
    }
    return Promise.resolve([]);
  }

  protected getTotalPurchasedVolumeByYear(
    rangeOfYears: number[],
    dataForImpactTable: ImpactTableData[],
    lastYearWithData: number,
    scenarioId?: string,
  ): ImpactTablePurchasedTonnes[] {
    // First scan the whole table to accumulate the values for each year
    const purchasedTonnesYearMap: Map<number, number> = new Map();

    for (const impactTableData of dataForImpactTable) {
      const accumulatedPurchasedTonnes: number | undefined =
        purchasedTonnesYearMap.get(impactTableData.year) || 0;

      const currentPurchasedTonnes: number = Number.isFinite(
        +impactTableData.tonnes,
      )
        ? +impactTableData.tonnes // TODO!!!!!!
        : 0;

      purchasedTonnesYearMap.set(
        impactTableData.year,
        currentPurchasedTonnes + accumulatedPurchasedTonnes,
      );
    }

    //Calculate projected data for missing years and construct result array
    const purchasedTonnes: ImpactTablePurchasedTonnes[] = [];
    rangeOfYears.forEach((year: number) => {
      let currentPurchasedTonnesByYear: number | undefined =
        purchasedTonnesYearMap.get(year);
      let isProjected: boolean = false;

      // If value exist for that year, append it. There will always be a first valid value to start with
      // If it does not exist, get the previous value and project it
      if (!currentPurchasedTonnesByYear) {
        // TODO: this is hotfix for situations where we receive a start year for which we don't have data
        const previousYearTonnage: number =
          purchasedTonnes.length > 0
            ? purchasedTonnes[purchasedTonnes.length - 1].value
            : 0;
        const tonnesToProject: number =
          dataForImpactTable.length > 0 ? previousYearTonnage : 0;

        currentPurchasedTonnesByYear =
          tonnesToProject + (tonnesToProject * this.growthRate) / 100;
        isProjected = year > lastYearWithData;
      }

      purchasedTonnes.push({
        year,
        value: currentPurchasedTonnesByYear,
        isProjected,
      });
    });

    if (scenarioId)
      purchasedTonnes.map((el: ImpactTablePurchasedTonnes) => (el.value /= 2));

    return purchasedTonnes;
  }

  protected static getIdsFromTree(
    entities: ImpactTableEntityType[],
    entityIds?: string[],
  ): string[] {
    const idsFromTree: string[] = entities.reduce(
      (ids: string[], entity: ImpactTableEntityType) => {
        const childIds: string[] =
          entity.children.length > 0
            ? this.getIdsFromTree(entity.children)
            : [];
        return [...ids, ...childIds, entity.id];
      },
      [],
    );
    return entityIds
      ? entityIds.filter((value: string) => idsFromTree.includes(value))
      : idsFromTree;
  }

  protected static paginateRootEntities(
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

  protected static paginateTable(
    data: any,
    fetchSpecification: FetchSpecification,
  ): any {
    if (fetchSpecification.disablePagination) {
      return {
        data,
        metadata: undefined,
      };
    }

    const pageSize: number =
      fetchSpecification?.pageSize ?? DEFAULT_PAGINATION.pageSize ?? 25;
    const page: number =
      fetchSpecification?.pageNumber ?? DEFAULT_PAGINATION.pageNumber ?? 1;

    // Make a shallow copy of the data to avoid mutating the original
    const paginatedData: any = { ...data };

    const totalItems: number = paginatedData.impactTable[0]?.rows?.length;
    const totalPages: number = Math.ceil(totalItems / pageSize);

    // If there are no rows or the number of rows is less than the page size, return the data as is
    if (totalItems === 0 || totalItems < pageSize) {
      return {
        data: paginatedData,
        metadata: new PaginationMeta({
          totalPages,
          totalItems,
          size: pageSize,
          page,
        }),
      };
    }
    // For each indicator, paginate its rows array
    for (let i: number = 0; i < paginatedData.impactTable.length; i++) {
      paginatedData.impactTable[i].rows = paginatedData.impactTable[
        i
      ].rows.slice((page - 1) * pageSize, page * pageSize);
    }

    return {
      data: paginatedData,
      metadata: new PaginationMeta({
        totalPages,
        totalItems,
        size: pageSize,
        page,
      }),
    };
  }

  /**
   * Converts an array of flat Impact Table Data (either for normal, Actual Vs Scenario or Scenario vs Scenario)
   * to a pseudo-tree structure of corresponding RowsValues Instance  based on maps for easier/faster access, like this
   *    Map<
   *      indicatorId:string,
   *      Map<
   *        entityName:string,
   *        Map<
   *          year:number,
   *          ImpactTableRowsValues
   *        >
   *      >
   *    >
   *   {
   *     "deforestationRiskId": {
   *       "Brazil": {
   *         2010: {
   *           year: 2010
   *           value: 12483
   *           ....
   *         },
   *         2011: {...},
   *         ......
   *       },
   *       "Paraná": {...},
   *       ....
   *     },
   *     "waterUseIndicatorId": {....},
   *     .....
   *   }
   * dataToRowsValuesFunc will be used to create the RowsValues instances of the given type from the given Impact Table Data instance
   * It also determines the last year with Data, so that another full sweep of the database can be avoided for
   * optimization
   * @param dataForImpactTable
   * @param dataToRowsValuesFunc
   * @private
   */
  protected static impactTableDataArrayToAuxMapV2<
    Data extends AnyImpactTableData,
    RowsValues extends AnyImpactTableRowsValues,
  >(
    dataForImpactTable: Data[],
    dataToRowsValuesFunc: (data: Data) => RowsValues,
  ): [ImpactDataTableAuxMap<RowsValues>, number] {
    // NOTE: the impact Table Data can be quite large, so to calculate the maximum number of years is not as trivial
    // as using Math.max(...impactTable.map(...)) since the call stack will be exceeded because of no of arguments
    const yearsWithData: Set<number> = new Set();

    const indicatorEntityMap: ImpactDataTableAuxMap<RowsValues> = new Map();

    // Convert the flat structure on array to tree of Maps for easier access
    for (const impactTableData of dataForImpactTable) {
      let entityMap: Map<string, Map<number, RowsValues>> | undefined =
        indicatorEntityMap.get(impactTableData.indicatorId);

      if (!entityMap) {
        entityMap = new Map();
        indicatorEntityMap.set(impactTableData.indicatorId, entityMap);
      }

      let yearMap: Map<number, RowsValues> | undefined = entityMap.get(
        impactTableData.name,
      );
      if (!yearMap) {
        yearMap = new Map();
        entityMap.set(impactTableData.name, yearMap);
      }

      yearMap.set(impactTableData.year, dataToRowsValuesFunc(impactTableData));

      yearsWithData.add(impactTableData.year);
    }

    const lastYearWithData: number = Math.max(...yearsWithData.values());

    return [indicatorEntityMap, lastYearWithData];
  }

  /**
   * This method preprocesses Impact Table data for comparison between actual data and an scenario
   * @param impactTableData
   * @protected
   */
  protected static processDataForComparison(
    impactTableData: ImpactTableData[],
  ): ActualVsScenarioImpactTableData[] {
    // Separate the data into different maps depending on whether data is from a scenario or not
    const actualData: Map<string, ActualVsScenarioImpactTableData> = new Map();
    const scenarioData: ActualVsScenarioImpactTableData[] = [];
    for (const data of impactTableData) {
      const key: string = BaseImpactService.getImpactTableDataKey(data);

      // By default, if real sourcing data is not affected by scenario - we assume that real impact and scenario impact are the same
      // so scenarioImpact is initialized with impact value for all instances
      const actualVsScenarioData: ActualVsScenarioImpactTableData =
        Object.assign({ scenarioImpact: data.impact }, data);

      data.typeByIntervention !== null
        ? scenarioData.push(actualVsScenarioData)
        : actualData.set(key, actualVsScenarioData);
    }

    // For all actual data check if there's corresponding scenario data and aggregate it, and discarding it afterwards
    // Once finished, the remaining data on the scenario map will be scenario data has no matching actual data
    // (for example, if scenario objective is to use a new material that has never been purchased before, so there is no 'real' data for this material)
    const scenarioDataWithoutRealData: ActualVsScenarioImpactTableData[] = [];
    for (const data of scenarioData.values()) {
      const matchingMatchingData: ActualVsScenarioImpactTableData | undefined =
        actualData.get(BaseImpactService.getImpactTableDataKey(data));

      if (matchingMatchingData) {
        matchingMatchingData.scenarioImpact += data.impact;
      } else {
        scenarioDataWithoutRealData.push(data);
      }
    }

    const result: ActualVsScenarioImpactTableData[] = Array.from(
      actualData.values(),
    );

    //Include the impact for scenario without a matching actual data in the result with an actual impact value of 0
    scenarioDataWithoutRealData.forEach(
      (data: ActualVsScenarioImpactTableData) => {
        //data.scenarioImpact = data.impact;
        data.impact = 0;
        result.push(data);
      },
    );

    return result;
  }

  /**
   * Small helper function to get the combined IndicatorId+EntityName+Year to facilitate pre processing of
   * Impact Table Data before building the impact table
   * @param data
   * @protected
   */
  protected static getImpactTableDataKey(data: ImpactTableData): string {
    return data.indicatorId + '-' + data.name + '-' + data.year;
  }

  protected static sortRowValueByYear(
    a: AnyImpactTableRowsValues,
    b: AnyImpactTableRowsValues,
  ): number {
    return a.year - b.year;
  }
}

export type ImpactDataTableAuxMap<T extends AnyImpactTableRowsValues> = Map<
  string,
  Map<string, Map<number, T>>
>;

import { Injectable, Logger } from '@nestjs/common';
import {
  GetImpactTableDto,
  GetRankedImpactTableDto,
} from 'modules/impact/dto/impact-table.dto';
import { IndicatorsService } from 'modules/indicators/indicators.service';
import { SourcingRecordsService } from 'modules/sourcing-records/sourcing-records.service';
import { ImpactTableData } from 'modules/sourcing-records/sourcing-record.repository';
import { Indicator } from 'modules/indicators/indicator.entity';
import { range } from 'lodash';
import {
  ImpactTable,
  ImpactTableDataAggregatedValue,
  ImpactTableDataByIndicator,
  ImpactTablePurchasedTonnes,
  ImpactTableRows,
  ImpactTableRowsValues,
  PaginatedImpactTable,
  YearSumData,
} from 'modules/impact/dto/response-impact-table.dto';
import { BusinessUnitsService } from 'modules/business-units/business-units.service';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';
import { SuppliersService } from 'modules/suppliers/suppliers.service';
import { MaterialsService } from 'modules/materials/materials.service';
import { GROUP_BY_VALUES } from 'modules/h3-data/dto/get-impact-map.dto';
import { ImpactTableEntityType } from 'types/impact-table-entity.type';
import { DEFAULT_PAGINATION, FetchSpecification } from 'nestjs-base-service';
import { PaginatedEntitiesDto } from 'modules/impact/dto/paginated-entities.dto';
import { GetMaterialTreeWithOptionsDto } from 'modules/materials/dto/get-material-tree-with-options.dto';
import { LOCATION_TYPES } from 'modules/sourcing-locations/sourcing-location.entity';
import { PaginationMeta } from 'utils/app-base.service';

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

    //Getting Descendants Ids for the filters, in case Parent Ids were received
    await this.loadDescendantEntityIds(impactTableDto);

    // Get full entity tree in cate ids are not passed, otherwise get trees based on
    // given ids and add children and parent ids to them to get full data for aggregations
    // TODO check if tree ids search is redundant
    const entities: ImpactTableEntityType[] = await this.getEntityTree(
      impactTableDto,
    );

    const paginatedEntities: PaginatedEntitiesDto =
      ImpactService.paginateRootEntities(entities, fetchSpecification);

    this.updateGroupByCriteriaFromEntityTree(
      impactTableDto,
      paginatedEntities.entities,
    );

    let dataForImpactTable: ImpactTableData[] =
      await this.getDataForImpactTable(
        impactTableDto,
        paginatedEntities.entities,
      );

    if (impactTableDto.scenarioId) {
      dataForImpactTable =
        ImpactService.processImpactDataWithScenario(dataForImpactTable);
    }

    const impactTable: ImpactTable = this.buildImpactTable(
      impactTableDto,
      indicators,
      dataForImpactTable,
      paginatedEntities.entities,
    );

    return { data: impactTable, metadata: paginatedEntities.metadata };
  }

  /**
   * Returns an ImpactTable with results ranked according to the dto's sort property
   * and showing a max of maxRankingEntities, with the rest aggregated into an "others" property
   * for each indicator
   * The process is very similar to that of the original getImpactTable function, with the
   * difference that the root entities are not paginated, and the ranking postprocessing
   * @param rankedImpactTableDto
   */
  async getRankedImpactTable(
    rankedImpactTableDto: GetRankedImpactTableDto,
  ): Promise<ImpactTable> {
    const indicators: Indicator[] =
      await this.indicatorService.getIndicatorsById(
        rankedImpactTableDto.indicatorIds,
      );
    this.logger.log('Retrieving data from DB to build Impact Table...');

    // Load Entities
    await this.loadDescendantEntityIds(rankedImpactTableDto);

    // TODO check if tree ids search is redundant
    const entities: ImpactTableEntityType[] = await this.getEntityTree(
      rankedImpactTableDto,
    );

    this.updateGroupByCriteriaFromEntityTree(rankedImpactTableDto, entities);

    // Construct Impact Data Table
    let dataForImpactTable: ImpactTableData[] =
      await this.getDataForImpactTable(rankedImpactTableDto, entities);

    if (rankedImpactTableDto.scenarioId) {
      dataForImpactTable =
        ImpactService.processImpactDataWithScenario(dataForImpactTable);
    }

    const impactTable: ImpactTable = this.buildImpactTable(
      rankedImpactTableDto,
      indicators,
      dataForImpactTable,
      entities,
    );

    // Cap the results to the Ranking Max, and aggregate the rest of the results
    return await this.applyRankingProcessing(rankedImpactTableDto, impactTable);
  }

  /**
   * Modifies the incoming ImpactTable in-place, by sorting and then aggregating entities into an "others" field
   * for each Indicator, with these properties
   *   aggregatedValues: An array with the sum of impact values per year, of the entities that exceed maxRankingEntities
   *   numberOAggregatedEntities: The number entities that exceed maxRankingEntities
   * If the number of entities for an indicator is less than the maxRankingEntities, both the aggregatedValues
   * and numberOAggregatedEntities will be 0
   * @param rankedImpactTableDto
   * @param impactTable
   */
  async applyRankingProcessing(
    rankedImpactTableDto: GetRankedImpactTableDto,
    impactTable: ImpactTable,
  ): Promise<ImpactTable> {
    // Since it's a TOP ranking, DESCENDENT sort will be the default if no sort option is provided
    const sort: string = rankedImpactTableDto.sort
      ? rankedImpactTableDto.sort
      : 'DES';
    const { startYear, endYear, maxRankingEntities } = rankedImpactTableDto;

    // Helper function used in sorting the entities later, defined here for readability
    // Gets the impact value of the given year, if not found, 0 is returned
    const getYearImpact = (row: ImpactTableRows, year: number): number => {
      const yearValue: ImpactTableRowsValues | undefined = row.values.find(
        (value: ImpactTableRowsValues) => value.year === year,
      );

      return yearValue ? yearValue.value : 0;
    };

    //For each indicator, Sort and limit the number of impact data for entity rows
    //and aggregate impact data over the max Ranking
    for (const impactTableDataByIndicator of impactTable.impactTable) {
      //Sort the impact data rows by the most impact on the starYear
      impactTableDataByIndicator.rows = impactTableDataByIndicator.rows?.sort(
        (a: ImpactTableRows, b: ImpactTableRows) => {
          if (sort === 'ASC') {
            return getYearImpact(a, startYear) - getYearImpact(b, startYear);
          } else {
            // return DESCENDENT order by default
            return getYearImpact(b, startYear) - getYearImpact(a, startYear);
          }
        },
      );

      // extract the entities that are over the maxRankingEntities threshold
      const discardedEntities: ImpactTableRows[] =
        impactTableDataByIndicator.rows.splice(maxRankingEntities);

      // Aggregate the values of the entities over the maxRankingEntities for each year
      const aggregatedValuesPerYear: ImpactTableDataAggregatedValue[] = range(
        startYear,
        endYear + 1,
      ).map((year: number) => {
        const value: number = discardedEntities.reduce(
          (aggregate: number, current: ImpactTableRows) =>
            aggregate + getYearImpact(current, year),
          0,
        );

        return { year, value: value };
      });

      impactTableDataByIndicator.others = {
        aggregatedValues: aggregatedValuesPerYear,
        numberOfAggregatedEntities: discardedEntities.length,
        sort,
      };
    }

    return impactTable;
  }

  /**
   * Modifies the ImpactTabledto such that, for each entityIds that is populated,
   * the ids of their descendants are added, in-place
   * @param impactTableDto
   * @private
   */
  private async loadDescendantEntityIds(
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
    if (impactTableDto.supplierIds)
      impactTableDto.supplierIds =
        await this.suppliersService.getSuppliersDescendants(
          impactTableDto.supplierIds,
        );

    return impactTableDto;
  }

  /**
   * @description Returns an array of ImpactTable Entities, determined by the groupBy field and properties
   * of the GetImpactTableDto
   * @param impactTableDto
   * @private
   */
  private async getEntityTree(
    impactTableDto: GetImpactTableDto,
  ): Promise<ImpactTableEntityType[]> {
    const treeOptions: GetMaterialTreeWithOptionsDto = {
      ...(impactTableDto.materialIds && {
        materialIds: impactTableDto.materialIds,
      }),
      ...(impactTableDto.originIds && {
        originIds: impactTableDto.originIds,
      }),
      ...(impactTableDto.supplierIds && {
        supplierIds: impactTableDto.supplierIds,
      }),
      ...(impactTableDto.scenarioIds && {
        scenarioIds: impactTableDto.scenarioIds,
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
      case GROUP_BY_VALUES.SUPPLIER: {
        return this.suppliersService.getSuppliersWithSourcingLocations(
          treeOptions,
        );
      }
      case GROUP_BY_VALUES.BUSINESS_UNIT:
        return this.businessUnitsService.getBusinessUnitWithSourcingLocations(
          treeOptions,
        );

      case GROUP_BY_VALUES.LOCATION_TYPE:
        return Object.values(LOCATION_TYPES).map((entity: LOCATION_TYPES) => {
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
   * @private
   */
  private updateGroupByCriteriaFromEntityTree(
    impactTableDto: GetImpactTableDto,
    entities: ImpactTableEntityType[],
  ): void {
    switch (impactTableDto.groupBy) {
      case GROUP_BY_VALUES.MATERIAL:
        impactTableDto.materialIds = this.getIdsFromTree(
          entities,
          impactTableDto.materialIds,
        );
        break;
      case GROUP_BY_VALUES.REGION:
        impactTableDto.originIds = this.getIdsFromTree(
          entities,
          impactTableDto.originIds,
        );
        break;
      case GROUP_BY_VALUES.SUPPLIER:
        impactTableDto.supplierIds = this.getIdsFromTree(
          entities,
          impactTableDto.supplierIds,
        );
        break;
      default:
    }
  }

  private getDataForImpactTable(
    impactTableDto: GetImpactTableDto,
    entities: ImpactTableEntityType[],
  ): Promise<ImpactTableData[]> {
    return entities.length
      ? this.sourcingRecordService.getDataForImpactTable(impactTableDto)
      : Promise.resolve([]);
  }

  private buildImpactTable(
    queryDto: GetImpactTableDto,
    indicators: Indicator[],
    dataForImpactTable: ImpactTableData[],
    entityTree: ImpactTableEntityType[],
  ): ImpactTable {
    this.logger.log('Building Impact Table...');
    const { groupBy, startYear, endYear } = queryDto;

    const auxIndicatorMap: Map<string, Indicator> = new Map(
      indicators.map((value: Indicator) => [value.id, value]),
    );

    // Create a range of years by start and endYears
    const rangeOfYears: number[] = range(startYear, endYear + 1);

    //Auxiliary structure in order to avoid scanning the whole table more than once
    const [indicatorEntityMap, lastYearWithData]: [
      Map<string, Map<string, Map<number, ImpactTableRowsValues>>>,
      number,
    ] = this.impactTableDataArrayToAuxMap(dataForImpactTable);

    // construct result impact Table
    const impactTable: ImpactTableDataByIndicator[] = [];

    for (const [indicatorId, entityMap] of indicatorEntityMap.entries()) {
      const indicator: Indicator = auxIndicatorMap.get(
        indicatorId,
      ) as Indicator;
      const impactTableDataByIndicator: ImpactTableDataByIndicator = {
        indicatorShortName: indicator.shortName as string,
        indicatorId: indicator.id,
        groupBy: groupBy,
        rows: [],
        yearSum: [],
        metadata: { unit: indicator.unit.symbol },
      };
      impactTable.push(impactTableDataByIndicator);

      // since some entities may be missing values for any given year, we need to do another pass to calculate
      // values for missing or projected years, and also calculates the total sum for each year
      const yearSumMap: Map<number, number> = this.postProcessYearIndicatorData(
        rangeOfYears,
        lastYearWithData,
        entityMap,
      );

      // copy and populate tree skeleton for each indicator
      const impactTableEntitySkeleton: ImpactTableRows[] =
        this.buildImpactTableRowsSkeleton(entityTree);

      for (const entity of impactTableEntitySkeleton) {
        this.populateValuesRecursively(entity, entityMap, rangeOfYears);
      }

      impactTableDataByIndicator.rows = impactTableEntitySkeleton;

      impactTableDataByIndicator.yearSum.push(
        ...Array.from(yearSumMap).map(([year, sum]: [number, number]) => {
          return { year, value: sum } as YearSumData;
        }),
      );
    }

    const purchasedTonnes: ImpactTablePurchasedTonnes[] =
      this.getTotalPurchasedVolumeByYear(
        rangeOfYears,
        dataForImpactTable,
        lastYearWithData,
      );
    this.logger.log('Impact Table built');

    return { impactTable, purchasedTonnes };
  }

  private getTotalPurchasedVolumeByYear(
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

  /**
   * Converts an array of flat Impact Table Data to a pseudo-tree structure based on maps
   * for easier/faster access, like this
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
   * It also determines the last year with Data, so that another full sweep of the database can be avoided for
   * optimization
   * @param dataForImpactTable
   * @private
   */
  private impactTableDataArrayToAuxMap(
    dataForImpactTable: ImpactTableData[],
  ): [Map<string, Map<string, Map<number, ImpactTableRowsValues>>>, number] {
    // NOTE: the impact Table Data can be quite large, so to calculate the maximum number of years is not as trivial
    // as using Math.max(...impactTable.map(...)) since the call stack will be exceeded because of no of arguments
    const yearsWithData: Set<number> = new Set();

    const indicatorEntityMap: Map<
      string,
      Map<string, Map<number, ImpactTableRowsValues>>
    > = new Map();

    // Convert the flat structure on array to tree of Maps for easier access
    for (const impactTableData of dataForImpactTable) {
      let entityMap:
        | Map<string, Map<number, ImpactTableRowsValues>>
        | undefined = indicatorEntityMap.get(impactTableData.indicatorId);

      if (!entityMap) {
        entityMap = new Map();
        indicatorEntityMap.set(impactTableData.indicatorId, entityMap);
      }

      let yearMap: Map<number, ImpactTableRowsValues> | undefined =
        entityMap.get(impactTableData.name);
      if (!yearMap) {
        yearMap = new Map();
        entityMap.set(impactTableData.name, yearMap);
      }

      yearMap.set(impactTableData.year, {
        year: impactTableData.year,
        value: impactTableData.impact,
        isProjected: false,
      });

      yearsWithData.add(impactTableData.year);
    }

    const lastYearWithData: number = Math.max(...yearsWithData.values());

    return [indicatorEntityMap, lastYearWithData];
  }

  /**
   * This functions does 2 things
   * - fill any missing years in the entityies' yearMap, with the calculation based on previous years' data
   * - calculate the value sum for all years, across all entities
   * @param rangeOfYears
   * @param lastYearWithData
   * @param entityMap
   * @private
   */
  private postProcessYearIndicatorData(
    rangeOfYears: number[],
    lastYearWithData: number,
    entityMap: Map<string, Map<number, ImpactTableRowsValues>>,
  ): Map<number, number> {
    //We also calculate the yearsum for each indicator
    const yearSumMap: Map<number, number> = new Map();

    for (const [entityName, yearMap] of entityMap.entries()) {
      const auxYearValues: number[] = [];

      for (const [index, year] of rangeOfYears.entries()) {
        let dataForYear: ImpactTableRowsValues | undefined = yearMap.get(year);

        //If the year requested by the users exist in the raw data, append its value. There will always be a first valid value to start with
        if (!dataForYear) {
          // If the year requested does no exist in the raw data, project its value getting the latest value (previous year which comes in ascendant order)
          const isProjected: boolean = year > lastYearWithData;

          const lastYearsValue: number =
            index > 0 ? auxYearValues[index - 1] : 0;
          const value: number =
            lastYearsValue + (lastYearsValue * this.growthRate) / 100;

          dataForYear = {
            year,
            value,
            isProjected,
          };
          yearMap.set(year, dataForYear);
        }

        auxYearValues.push(dataForYear.value);

        //Append to the sumYear total
        const yearSum: number = yearSumMap.get(year) || 0;
        yearSumMap.set(year, yearSum + dataForYear.value);
      }
    }

    return yearSumMap;
  }

  /**
   * @description Recursive function that populates and returns
   * aggregated data of parent entity and all its children
   */
  private populateValuesRecursively(
    entity: ImpactTableRows,
    entityMap: Map<string, Map<number, ImpactTableRowsValues>>,
    rangeOfYears: number[],
    scenarioId?: string,
  ): ImpactTableRowsValues[] {
    entity.values = [];
    for (const year of rangeOfYears) {
      entity.values.push({
        year: year,
        value: 0,
        isProjected: false,
        ...(scenarioId && { interventionValue: 0 }),
      });
    }

    const valuesToAggregate: ImpactTableRowsValues[][] = [];
    const selfData: Map<number, ImpactTableRowsValues> | undefined =
      entityMap.get(entity.name);
    if (selfData) {
      const sortedSelfData: ImpactTableRowsValues[] = Array.from(
        selfData.values(),
      ).sort(
        (a: ImpactTableRowsValues, b: ImpactTableRowsValues) => a.year - b.year,
      );
      valuesToAggregate.push(sortedSelfData);
    }
    entity.children.forEach((childEntity: ImpactTableRows) => {
      valuesToAggregate.push(
        /*
         * first aggregate data of child entity and then add returned value for
         * parents aggregation
         */
        this.populateValuesRecursively(
          childEntity,
          entityMap,
          rangeOfYears,
          scenarioId,
        ),
      );
    });
    for (const [valueIndex, impactTableRowsValues] of entity.values.entries()) {
      valuesToAggregate.forEach((item: ImpactTableRowsValues[]) => {
        entity.values[valueIndex].value =
          impactTableRowsValues.value + item[valueIndex].value;
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

  private getIdsFromTree(
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

  private static paginateRootEntities(
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

  private static processImpactDataWithScenario(
    dataForImpactTableWithScenario: ImpactTableData[],
  ): ImpactTableData[] {
    const result: ImpactTableData[] = [];

    // Geting array with sourcing data  for real existing locations
    const realSourcingData: ImpactTableData[] =
      dataForImpactTableWithScenario.filter((el: ImpactTableData) => {
        return el.typeByIntervention === null;
      });

    // Geting array with sourcing data for locations created by Scenario
    const scenarioSourcingData: ImpactTableData[] =
      dataForImpactTableWithScenario.filter((el: ImpactTableData) => {
        return el.typeByIntervention !== null;
      });

    // Start iterating real data to check if it has been affected by Scenario and calculating scenarioImpact
    realSourcingData.forEach((realData: ImpactTableData) => {
      scenarioSourcingData.forEach((scenarioData: ImpactTableData) => {
        if (
          scenarioData.name === realData.name &&
          scenarioData.year === realData.year &&
          scenarioData.indicatorId === realData.indicatorId &&
          scenarioData.typeByIntervention !== null
        ) {
          realData.impact += scenarioData.impact;
        }
      });
      result.push(realData);
    });

    /**
     * We need to check if some of the scenario data has no real data
     * (for example, if scenario objective is to use a new material that has never been purchased before, so there is no 'real' data for this material)
     * In that case impact value (actual or real impact, without Scenario, should be 0)*/

    scenarioSourcingData.forEach((scenarioData: ImpactTableData) => {
      const realDataForEntities: ImpactTableData | undefined =
        realSourcingData.find((realData: ImpactTableData) => {
          return (
            realData.year === scenarioData.year &&
            realData.name === scenarioData.name
          );
        });

      if (!realDataForEntities) {
        result.push(scenarioData);
      }
    });

    return result;
  }
}

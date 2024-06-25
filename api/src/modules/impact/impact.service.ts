import { Injectable, Logger } from '@nestjs/common';
import {
  GetImpactTableDto,
  GetRankedImpactTableDto,
  GROUP_BY_VALUES,
  ORDER_BY,
} from 'modules/impact/dto/impact-table.dto';
import { IndicatorsService } from 'modules/indicators/indicators.service';
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
import { MaterialsService } from 'modules/materials/materials.service';
import { ImpactTableEntityType } from 'types/impact-table-entity.type';
import { FetchSpecification } from 'nestjs-base-service';
import {
  BaseImpactService,
  ImpactDataTableAuxMap,
} from 'modules/impact/base-impact.service';
import { ImpactViewUpdater } from 'modules/impact/views/impact-view.updater';

@Injectable()
export class ImpactService {
  logger: Logger = new Logger(ImpactService.name);

  constructor(
    protected readonly indicatorService: IndicatorsService,
    protected readonly baseService: BaseImpactService,
    protected readonly materialsService: MaterialsService,
    private readonly viewUpdater: ImpactViewUpdater,
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
    await this.baseService.loadDescendantEntityIds(impactTableDto);

    // Get full entity tree in cate ids are not passed, otherwise get trees based on
    // given ids and add children and parent ids to them to get full data for aggregations
    const entities: ImpactTableEntityType[] =
      await this.baseService.getEntityTree(impactTableDto);

    this.baseService.getFlatListOfEntityIdsForLaterFiltering(
      impactTableDto,
      entities,
    );

    let dataForImpactTable: ImpactTableData[] =
      await this.baseService.getDataForImpactTable(impactTableDto, entities);

    if (impactTableDto.scenarioId) {
      dataForImpactTable =
        ImpactService.processImpactDataWithScenario(dataForImpactTable);
    }

    const impactTable: ImpactTable = this.buildImpactTable(
      impactTableDto,
      indicators,
      dataForImpactTable,
      entities,
    );

    this.sortEntitiesByImpactOfYear(
      impactTable,
      impactTableDto.sortingYear,
      impactTableDto.sortingOrder,
    );
    return BaseImpactService.paginateTable(impactTable, fetchSpecification);
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
    await this.baseService.loadDescendantEntityIds(rankedImpactTableDto);

    // TODO check if tree ids search is redundant
    const entities: ImpactTableEntityType[] =
      await this.baseService.getEntityTree(rankedImpactTableDto);

    this.baseService.getFlatListOfEntityIdsForLaterFiltering(
      rankedImpactTableDto,
      entities,
    );

    // Construct Impact Data Table
    let dataForImpactTable: ImpactTableData[] =
      await this.baseService.getDataForImpactTable(
        rankedImpactTableDto,
        entities,
      );

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

    const sortByStartingYearImpact = (
      a: ImpactTableRows,
      b: ImpactTableRows,
    ): number => {
      return sort === 'ASC'
        ? this.getYearImpact(a, startYear) - this.getYearImpact(b, startYear)
        : this.getYearImpact(b, startYear) - this.getYearImpact(a, startYear);
    };

    //For each indicator, Sort and limit the number of impact data for entity rows
    //and aggregate impact data over the max Ranking
    for (const impactTableDataByIndicator of impactTable.impactTable) {
      //Sort the impact data rows by the most impact on the starYear
      impactTableDataByIndicator.rows = impactTableDataByIndicator.rows?.sort(
        sortByStartingYearImpact,
      );

      // extract the entities that are over the maxRankingEntities threshold
      const overMaxRankingEntities: ImpactTableRows[] =
        impactTableDataByIndicator.rows.splice(maxRankingEntities);

      // Aggregate the values of the entities over the maxRankingEntities for each year
      const aggregatedValuesPerYear: ImpactTableDataAggregatedValue[] = range(
        startYear,
        endYear + 1,
      ).map((year: number) => {
        const value: number = overMaxRankingEntities.reduce(
          (aggregate: number, current: ImpactTableRows) =>
            aggregate + this.getYearImpact(current, year),
          0,
        );

        return { year, value };
      });

      impactTableDataByIndicator.others = {
        aggregatedValues: aggregatedValuesPerYear,
        numberOfAggregatedEntities: overMaxRankingEntities.length,
        sort,
      };
    }

    return impactTable;
  }

  async updateImpactView(): Promise<void> {
    return this.viewUpdater.updateImpactView();
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
      ImpactDataTableAuxMap<ImpactTableRowsValues>,
      number,
    ] = BaseImpactService.impactTableDataArrayToAuxMapV2<
      ImpactTableData,
      ImpactTableRowsValues
    >(dataForImpactTable, this.createRowValueFromImpactData);

    // construct result impact Table
    const impactTable: ImpactTableDataByIndicator[] = [];

    for (const [indicatorId, entityMap] of indicatorEntityMap.entries()) {
      const indicator: Indicator = auxIndicatorMap.get(
        indicatorId,
      ) as Indicator;
      const impactTableDataByIndicator: ImpactTableDataByIndicator =
        this.createImpactTableDataByIndicator(indicator, groupBy);
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
      this.baseService.getTotalPurchasedVolumeByYear(
        rangeOfYears,
        dataForImpactTable,
        lastYearWithData,
      );
    this.logger.log('Impact Table built');

    return { impactTable, purchasedTonnes };
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

    for (const yearMap of entityMap.values()) {
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
            lastYearsValue +
            (lastYearsValue * this.baseService.growthRate) / 100;

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
  ): ImpactTableRowsValues[] {
    entity.values = [];
    for (const year of rangeOfYears) {
      const rowsValues: ImpactTableRowsValues = {
        year: year,
        value: 0,
        isProjected: false,
      };
      entity.values.push(rowsValues);
    }

    const valuesToAggregate: ImpactTableRowsValues[][] = [];
    const selfData: Map<number, ImpactTableRowsValues> | undefined =
      entityMap.get(entity.name);
    if (selfData) {
      const sortedSelfData: ImpactTableRowsValues[] = Array.from(
        selfData.values(),
      ).sort(BaseImpactService.sortRowValueByYear);
      valuesToAggregate.push(sortedSelfData);
    }
    entity.children.forEach((childEntity: ImpactTableRows) => {
      valuesToAggregate.push(
        // first aggregate data of child entity and then add returned value for parents aggregation
        this.populateValuesRecursively(childEntity, entityMap, rangeOfYears),
      );
    });
    for (const [valueIndex, entityRowValue] of entity.values.entries()) {
      for (const valueToAggregate of valuesToAggregate) {
        entityRowValue.value += valueToAggregate[valueIndex].value;
        entityRowValue.isProjected =
          valueToAggregate[valueIndex].isProjected ||
          entityRowValue.isProjected;
      }
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
          item.children?.length > 0
            ? this.buildImpactTableRowsSkeleton(item.children)
            : [],
        values: [],
      };
    });
  }

  private static processImpactDataWithScenario(
    dataForImpactTableWithScenario: ImpactTableData[],
  ): ImpactTableData[] {
    // Separate the data into different groups depending on whether data is from a scenario or not
    const actualData: Map<string, ImpactTableData> = new Map();
    const scenarioData: ImpactTableData[] = [];

    for (const data of dataForImpactTableWithScenario) {
      const key: string = BaseImpactService.getImpactTableDataKey(data);
      data.typeByIntervention !== null
        ? scenarioData.push(data)
        : actualData.set(key, data);
    }

    // For all actual data check if there's corresponding scenario data and aggregate it, and discarding it afterwards
    // Once finished, the remaining data on the scenario map will be scenario data has no real data
    // (for example, if scenario objective is to use a new material that has never been purchased before, so there is no 'real' data for this material)
    // In that case impact value (actual or real impact, without Scenario, should be 0)*/
    const scenarioDataWithoutRealData: ImpactTableData[] = [];
    for (const data of scenarioData) {
      const matchingRealData: ImpactTableData | undefined = actualData.get(
        BaseImpactService.getImpactTableDataKey(data),
      );

      if (matchingRealData) {
        matchingRealData.impact += data.impact;
      } else {
        scenarioDataWithoutRealData.push(data);
      }
    }

    const result: ImpactTableData[] = Array.from(actualData.values());

    scenarioDataWithoutRealData.forEach((data: ImpactTableData) =>
      result.push(data),
    );

    return result;
  }

  // For all indicators, entities are sorted by the value of the given sortingYear, in the order given by sortingOrder
  private sortEntitiesByImpactOfYear(
    impactTable: ImpactTable,
    sortingYear: number | undefined,
    sortingOrder: ORDER_BY | undefined = ORDER_BY.DESC,
  ): void {
    if (!sortingYear) {
      return;
    }

    for (const impactTableDataByIndicator of impactTable.impactTable) {
      this.sortEntitiesRecursively(
        impactTableDataByIndicator.rows,
        sortingYear,
        sortingOrder,
      );
    }
  }

  // Entities represented by ImpactTableRows will be sorted recursively by the value of the given
  // sortingYear, in the given sortingOrder
  private sortEntitiesRecursively(
    impactTableRows: ImpactTableRows[],
    sortingYear: number,
    sortingOrder: ORDER_BY,
  ): void {
    if (impactTableRows.length === 0) {
      return;
    }

    for (const row of impactTableRows) {
      this.sortEntitiesRecursively(row.children, sortingYear, sortingOrder);
    }

    impactTableRows.sort((a: ImpactTableRows, b: ImpactTableRows) =>
      sortingOrder === ORDER_BY.ASC
        ? this.getYearImpact(a, sortingYear) -
          this.getYearImpact(b, sortingYear)
        : this.getYearImpact(b, sortingYear) -
          this.getYearImpact(a, sortingYear),
    );
  }

  // Gets the absolute difference of the given year of the TableRow, if not found, 0 is returned
  // Helper function (for readability) used in sorting the entities by the absolute difference of impact on the given year,
  private getYearImpact(row: ImpactTableRows, year: number): number {
    const yearValue: ImpactTableRowsValues | undefined = row.values.find(
      (value: ImpactTableRowsValues) => value.year === year,
    );

    return yearValue ? yearValue.value : 0;
  }

  private createImpactTableDataByIndicator(
    indicator: Indicator,
    groupBy: GROUP_BY_VALUES,
  ): ImpactTableDataByIndicator {
    return {
      indicatorShortName: indicator.shortName as string,
      indicatorId: indicator.id,
      groupBy: groupBy,
      rows: [],
      yearSum: [],
      metadata: { unit: indicator.unit.symbol },
    };
  }

  private createRowValueFromImpactData(
    data: ImpactTableData,
  ): ImpactTableRowsValues {
    return {
      year: data.year,
      value: data.impact,
      isProjected: false,
    };
  }
}

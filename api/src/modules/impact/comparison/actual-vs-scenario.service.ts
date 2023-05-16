import { Injectable, Logger } from '@nestjs/common';
import {
  GetActualVsScenarioImpactTableDto,
  ORDER_BY,
} from 'modules/impact/dto/impact-table.dto';
import { IndicatorsService } from 'modules/indicators/indicators.service';
import { SourcingRecordsService } from 'modules/sourcing-records/sourcing-records.service';
import {
  ActualVsScenarioImpactTableData,
  ImpactTableData,
} from 'modules/sourcing-records/sourcing-record.repository';
import { Indicator } from 'modules/indicators/indicator.entity';
import { range } from 'lodash';
import {
  ImpactTablePurchasedTonnes,
  PaginatedImpactTable,
} from 'modules/impact/dto/response-impact-table.dto';
import { BusinessUnitsService } from 'modules/business-units/business-units.service';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';
import { SuppliersService } from 'modules/suppliers/suppliers.service';
import { MaterialsService } from 'modules/materials/materials.service';
import { ImpactTableEntityType } from 'types/impact-table-entity.type';
import { FetchSpecification } from 'nestjs-base-service';
import {
  ActualVsScenarioImpactTable,
  ActualVsScenarioImpactTableDataByIndicator,
  ActualVsScenarioImpactTableRows,
  ActualVsScenarioImpactTableRowsValues,
  ActualVsScenarioIndicatorSumByYear,
} from 'modules/impact/dto/response-actual-scenario.dto';
import {
  BaseImpactService,
  ImpactDataTableAuxMap,
} from 'modules/impact/base-impact.service';
import { SourcingLocationsService } from 'modules/sourcing-locations/sourcing-locations.service';

@Injectable()
export class ActualVsScenarioImpactService extends BaseImpactService {
  logger: Logger = new Logger(ActualVsScenarioImpactService.name);

  constructor(
    protected readonly indicatorService: IndicatorsService,
    protected readonly businessUnitsService: BusinessUnitsService,
    protected readonly adminRegionsService: AdminRegionsService,
    protected readonly suppliersService: SuppliersService,
    protected readonly materialsService: MaterialsService,
    protected readonly sourcingRecordService: SourcingRecordsService,
    protected readonly sourcingLocationsService: SourcingLocationsService,
  ) {
    super(
      indicatorService,
      businessUnitsService,
      adminRegionsService,
      suppliersService,
      materialsService,
      sourcingRecordService,
      sourcingLocationsService,
    );
  }

  async getActualVsScenarioImpactTable(
    dto: GetActualVsScenarioImpactTableDto,
    fetchSpecification: FetchSpecification,
  ): Promise<PaginatedImpactTable> {
    const indicators: Indicator[] =
      await this.indicatorService.getIndicatorsById(dto.indicatorIds);
    this.logger.log('Retrieving data from DB to build Impact Table...');

    //Getting Descendants Ids for the filters, in case Parent Ids were received
    await this.loadDescendantEntityIds(dto);

    // Get full entity tree in case ids are not passed, otherwise get trees based on
    // given ids and add children and parent ids to them to get full data for aggregations
    const entities: ImpactTableEntityType[] = await this.getEntityTree(dto);

    this.updateGroupByCriteriaFromEntityTree(dto, entities);

    const dataForActualVsScenarioImpactTable: ImpactTableData[] =
      await this.getDataForImpactTable(dto, entities);

    const processedDataForComparison: ActualVsScenarioImpactTableData[] =
      ActualVsScenarioImpactService.processDataForComparison(
        dataForActualVsScenarioImpactTable,
      );

    const impactTable: ActualVsScenarioImpactTable =
      this.buildActualVsScenarioImpactTable(
        dto,
        indicators,
        processedDataForComparison,
        entities,
      );

    this.sortEntitiesByImpactOfYear(
      impactTable,
      dto.sortingYear,
      dto.sortingOrder,
    );

    return BaseImpactService.paginateTable(impactTable, fetchSpecification);
  }

  private buildActualVsScenarioImpactTable(
    queryDto: GetActualVsScenarioImpactTableDto,
    indicators: Indicator[],
    dataForImpactTable: ActualVsScenarioImpactTableData[],
    entityTree: ImpactTableEntityType[],
  ): ActualVsScenarioImpactTable {
    this.logger.log('Building Impact Table...');
    const { groupBy, startYear, endYear } = queryDto;

    const auxIndicatorMap: Map<string, Indicator> = new Map(
      indicators.map((value: Indicator) => [value.id, value]),
    );

    // Create a range of years by start and endYears
    const rangeOfYears: number[] = range(startYear, endYear + 1);

    //Auxiliary structure in order to avoid scanning the whole table more than once
    const [indicatorEntityMap, lastYearWithData]: [
      ImpactDataTableAuxMap<ActualVsScenarioImpactTableRowsValues>,
      number,
    ] = BaseImpactService.impactTableDataArrayToAuxMapV2<
      ActualVsScenarioImpactTableData,
      ActualVsScenarioImpactTableRowsValues
    >(dataForImpactTable, this.createActualVsScenarioRowValueFromImpactData);

    // construct result impact Table
    const impactTable: ActualVsScenarioImpactTableDataByIndicator[] = [];

    for (const [indicatorId, entityMap] of indicatorEntityMap.entries()) {
      const indicator: Indicator = auxIndicatorMap.get(
        indicatorId,
      ) as Indicator;
      const impactTableDataByIndicator: ActualVsScenarioImpactTableDataByIndicator =
        this.createActualVsScenarioImpactTableDataByIndicator(
          indicator,
          groupBy,
        );
      impactTable.push(impactTableDataByIndicator);

      // since some entities may be missing values for any given year, we need to do another pass to calculate
      // values for missing or projected years, and also calculates the total sum for each year
      this.postProcessYearIndicatorData(
        entityMap,
        rangeOfYears,
        lastYearWithData,
      );

      // copy and populate tree skeleton for each indicator
      const impactTableEntitySkeleton: ActualVsScenarioImpactTableRows[] =
        this.buildActualVsScenarioImpactTableRowsSkeleton(entityTree);

      for (const entity of impactTableEntitySkeleton) {
        this.populateValuesRecursively(entity, entityMap, rangeOfYears);
      }

      impactTableDataByIndicator.rows = impactTableEntitySkeleton;

      impactTableDataByIndicator.yearSum = this.calculateIndicatorSumByYear(
        entityMap,
        rangeOfYears,
        lastYearWithData,
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

  /**
   * This functions fills, in-place, any missing years in the entities' yearMap, with the calculation based
   * on previous years' data
   * @param rangeOfYears
   * @param lastYearWithData
   * @param entityMap
   * @private
   */
  private postProcessYearIndicatorData(
    entityMap: Map<string, Map<number, ActualVsScenarioImpactTableRowsValues>>,
    rangeOfYears: number[],
    lastYearWithData: number,
  ): void {
    for (const yearMap of entityMap.values()) {
      const auxYearValues: number[] = [];
      const auxYearScenarioValues: number[] = [];

      for (const [index, year] of rangeOfYears.entries()) {
        let dataForYear: ActualVsScenarioImpactTableRowsValues | undefined =
          yearMap.get(year);

        //If the year requested by the users exist in the raw data, append its value. There will always be a first valid value to start with
        if (!dataForYear) {
          // If the year requested does no exist in the raw data, project its value getting the latest value (previous year which comes in ascendant order)
          const isProjected: boolean = year > lastYearWithData;

          const lastYearsValue: number =
            index > 0 ? auxYearValues[index - 1] : 0;
          const lastYearsScenarioValue: number =
            index > 0 ? auxYearScenarioValues[index - 1] || 0 : 0;
          const value: number =
            lastYearsValue + (lastYearsValue * this.growthRate) / 100;
          const comparedScenarioValue: number =
            lastYearsScenarioValue +
            (lastYearsScenarioValue * this.growthRate) / 100;

          dataForYear = {
            year,
            value,
            comparedScenarioValue,
            isProjected,
            absoluteDifference: 0,
            percentageDifference: 0,
          };
          yearMap.set(year, dataForYear);
        }

        auxYearValues.push(dataForYear.value);
        auxYearScenarioValues.push(dataForYear.comparedScenarioValue || 0);
      }
    }
  }

  /**
   * Returns an Array containing the sum of the values of all entities, by each year in rangeOfYears
   * @param entityMap
   * @param rangeOfYears
   * @param lastYearWithData
   * @private
   */
  private calculateIndicatorSumByYear(
    entityMap: Map<string, Map<number, ActualVsScenarioImpactTableRowsValues>>,
    rangeOfYears: number[],
    lastYearWithData: number,
  ): ActualVsScenarioIndicatorSumByYear[] {
    const yearSumMap: Map<number, number> = new Map();
    const yearScenarioSumMap: Map<number, number> = new Map();

    //Iterate over the entities to aggregate the year totals
    for (const dataByYearMap of entityMap.values()) {
      for (const year of rangeOfYears) {
        const dataByYear: ActualVsScenarioImpactTableRowsValues =
          dataByYearMap.get(year) as ActualVsScenarioImpactTableRowsValues;

        const yearSum: number = (yearSumMap.get(year) || 0) + dataByYear.value;
        const yearScenarioSum: number =
          (yearScenarioSumMap.get(year) || 0) +
          (dataByYear.comparedScenarioValue || 0);

        yearSumMap.set(year, yearSum);
        yearScenarioSumMap.set(year, yearScenarioSum);
      }
    }

    //Return the result Array from the year total Maps
    return rangeOfYears.map((year: number) => {
      const totalSumByYear: number = yearSumMap.get(year) || 0;
      const totalScenarioSumByYear: number = yearScenarioSumMap.get(year) || 0;

      return {
        year,
        value: totalSumByYear,
        comparedScenarioValue: totalScenarioSumByYear,
        absoluteDifference: totalScenarioSumByYear - totalSumByYear,
        percentageDifference:
          ((totalScenarioSumByYear - totalSumByYear) /
            ((totalScenarioSumByYear + totalSumByYear) / 2)) *
          100,
        isProjected: year > lastYearWithData,
      };
    });
  }

  /**
   * @description Recursive function that populates and returns
   * aggregated data of parent entity and all its children
   */
  private populateValuesRecursively(
    entity: ActualVsScenarioImpactTableRows,
    entityDataMap: Map<
      string,
      Map<number, ActualVsScenarioImpactTableRowsValues>
    >,
    rangeOfYears: number[],
  ): ActualVsScenarioImpactTableRowsValues[] {
    entity.values = [];
    for (const year of rangeOfYears) {
      const rowsValues: ActualVsScenarioImpactTableRowsValues = {
        year: year,
        value: 0,
        comparedScenarioValue: 0,
        absoluteDifference: 0,
        percentageDifference: 0,
        isProjected: false,
      };
      entity.values.push(rowsValues);
    }

    const valuesToAggregate: ActualVsScenarioImpactTableRowsValues[][] = [];
    const selfData:
      | Map<number, ActualVsScenarioImpactTableRowsValues>
      | undefined = entityDataMap.get(entity.id + entity.name);
    if (selfData) {
      const sortedSelfData: ActualVsScenarioImpactTableRowsValues[] =
        Array.from(selfData.values()).sort(
          BaseImpactService.sortRowValueByYear,
        );
      valuesToAggregate.push(sortedSelfData);
    }
    entity.children.forEach((childEntity: ActualVsScenarioImpactTableRows) => {
      //first aggregate data of child entity and then add returned value for parents aggregation
      const childValues: ActualVsScenarioImpactTableRowsValues[] =
        this.populateValuesRecursively(
          childEntity,
          entityDataMap,
          rangeOfYears,
        );
      valuesToAggregate.push(childValues);
    });

    for (const [valueIndex, entityRowValue] of entity.values.entries()) {
      for (const valueToAggregate of valuesToAggregate) {
        entityRowValue.value += valueToAggregate[valueIndex].value;
        entityRowValue.comparedScenarioValue +=
          valueToAggregate[valueIndex].comparedScenarioValue;
        entityRowValue.isProjected =
          valueToAggregate[valueIndex].isProjected ||
          entityRowValue.isProjected;

        entityRowValue.absoluteDifference =
          entityRowValue.comparedScenarioValue - entityRowValue.value;
        entityRowValue.percentageDifference =
          ((entityRowValue.comparedScenarioValue - entityRowValue.value) /
            ((entityRowValue.comparedScenarioValue + entityRowValue.value) /
              2)) *
          100;
      }
    }
    return entity.values;
  }

  private buildActualVsScenarioImpactTableRowsSkeleton(
    entities: ImpactTableEntityType[],
  ): ActualVsScenarioImpactTableRows[] {
    return entities.map((item: ImpactTableEntityType) => {
      return {
        id: item.id,
        name: item.name || '',
        children:
          item.children.length > 0
            ? this.buildActualVsScenarioImpactTableRowsSkeleton(item.children)
            : [],
        values: [],
      };
    });
  }

  // For all indicators, entities are sorted by the value of the given sortingYear, in the order given by sortingOrder
  private sortEntitiesByImpactOfYear(
    impactTable: ActualVsScenarioImpactTable,
    sortingYear: number | undefined,
    sortingOrder: ORDER_BY | undefined = ORDER_BY.ASC,
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

  // Entities represented by ImpactTableRows will be sorted recursively by the absoluteDifference value of the given
  // sortingYear, in the given sortingOrder
  private sortEntitiesRecursively(
    rows: ActualVsScenarioImpactTableRows[],
    sortingYear: number,
    sortingOrder: ORDER_BY,
  ): void {
    if (rows.length === 0) {
      return;
    }

    for (const row of rows) {
      this.sortEntitiesRecursively(row.children, sortingYear, sortingOrder);
    }

    rows.sort(
      (
        a: ActualVsScenarioImpactTableRows,
        b: ActualVsScenarioImpactTableRows,
      ) =>
        sortingOrder === ORDER_BY.ASC
          ? this.getYearAbsoluteDifference(a, sortingYear) -
            this.getYearAbsoluteDifference(b, sortingYear)
          : this.getYearAbsoluteDifference(b, sortingYear) -
            this.getYearAbsoluteDifference(a, sortingYear),
    );
  }

  // Gets the absolute difference of the given year of the TableRow, if not found, 0 is returned
  // Helper function (for readability) used in sorting the entities by the absolute difference of impact on the given year,
  private getYearAbsoluteDifference(
    row: ActualVsScenarioImpactTableRows,
    year: number,
  ): number {
    const yearValue: ActualVsScenarioImpactTableRowsValues | undefined =
      row.values.find(
        (value: ActualVsScenarioImpactTableRowsValues) => value.year === year,
      );

    return yearValue ? yearValue.absoluteDifference : 0;
  }

  private createActualVsScenarioImpactTableDataByIndicator(
    indicator: Indicator,
    groupBy: string,
  ): ActualVsScenarioImpactTableDataByIndicator {
    return {
      indicatorShortName: indicator.shortName as string,
      indicatorId: indicator.id,
      groupBy: groupBy,
      rows: [],
      yearSum: [],
      metadata: { unit: indicator.unit.symbol },
    };
  }

  private createActualVsScenarioRowValueFromImpactData(
    data: ActualVsScenarioImpactTableData,
  ): ActualVsScenarioImpactTableRowsValues {
    return {
      year: data.year,
      value: data.impact,
      comparedScenarioValue: data.scenarioImpact,
      isProjected: false,
      absoluteDifference: 0,
      percentageDifference: 0,
    };
  }
}

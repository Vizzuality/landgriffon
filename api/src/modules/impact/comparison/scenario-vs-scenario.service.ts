import { Injectable, Logger } from '@nestjs/common';
import {
  GetActualVsScenarioImpactTableDto,
  GetScenarioVsScenarioImpactTableDto,
  ORDER_BY,
} from 'modules/impact/dto/impact-table.dto';
import { IndicatorsService } from 'modules/indicators/indicators.service';
import { SourcingRecordsService } from 'modules/sourcing-records/sourcing-records.service';
import {
  ActualVsScenarioImpactTableData,
  ImpactTableData,
  ScenarioVsScenarioImpactTableData,
} from 'modules/sourcing-records/sourcing-record.repository';
import { Indicator } from 'modules/indicators/indicator.entity';
import { range } from 'lodash';
import { BusinessUnitsService } from 'modules/business-units/business-units.service';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';
import { SuppliersService } from 'modules/suppliers/suppliers.service';
import { MaterialsService } from 'modules/materials/materials.service';
import { ImpactTableEntityType } from 'types/impact-table-entity.type';
import { FetchSpecification } from 'nestjs-base-service';
import { PaginatedEntitiesDto } from 'modules/impact/dto/paginated-entities.dto';
import {
  ScenarioVsScenarioImpactTable,
  ScenarioVsScenarioImpactTableDataByIndicator,
  ScenarioVsScenarioImpactTableRows,
  ScenarioVsScenarioImpactTableRowsValues,
  ScenarioVsScenarioIndicatorSumByYearData,
  ScenarioVsScenarioPaginatedImpactTable,
} from 'modules/impact/dto/response-scenario-scenario.dto';
import {
  BaseImpactService,
  ImpactDataTableAuxMap,
} from 'modules/impact/base-impact.service';
import { ImpactTablePurchasedTonnes } from 'modules/impact/dto/response-impact-table.dto';
import { SourcingLocationsService } from 'modules/sourcing-locations/sourcing-locations.service';

@Injectable()
export class ScenarioVsScenarioImpactService extends BaseImpactService {
  logger: Logger = new Logger(ScenarioVsScenarioImpactService.name);

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

  async getScenarioVsScenarioImpactTable(
    dto: GetScenarioVsScenarioImpactTableDto,
    fetchSpecification: FetchSpecification,
  ): Promise<ScenarioVsScenarioPaginatedImpactTable> {
    const indicators: Indicator[] =
      await this.indicatorService.getIndicatorsById(dto.indicatorIds);
    this.logger.log('Retrieving data from DB to build Impact Table...');

    //Getting Descendants Ids for the filters, in case Parent Ids were received
    await this.loadDescendantEntityIds(dto);

    // Getting entities and processing that correspond to Scenario 1 and filtered actual data

    const entities: ImpactTableEntityType[] = await this.getEntityTree(dto);

    const paginatedEntities: PaginatedEntitiesDto =
      ScenarioVsScenarioImpactService.paginateRootEntities(
        entities,
        fetchSpecification,
      );

    this.updateGroupByCriteriaFromEntityTree(dto, paginatedEntities.entities);

    // Getting and proceesing impact data separetely for each scenario for further merge

    const { baseScenarioId, comparedScenarioId, ...generalDto } = dto;

    const scenarioOneDto: GetActualVsScenarioImpactTableDto = {
      comparedScenarioId: baseScenarioId,
      ...generalDto,
    };

    const scenarioTwoDto: GetActualVsScenarioImpactTableDto = {
      comparedScenarioId: comparedScenarioId,
      ...generalDto,
    };

    const dataForScenarioOneAndActual: ImpactTableData[] =
      await this.getDataForImpactTable(
        scenarioOneDto,
        paginatedEntities.entities,
      );

    const dataForScenarioTwoAndActual: ImpactTableData[] =
      await this.getDataForImpactTable(
        scenarioTwoDto,
        paginatedEntities.entities,
      );
    const processedScenarioVsScenarioData: ScenarioVsScenarioImpactTableData[] =
      ScenarioVsScenarioImpactService.processTwoScenariosData(
        dataForScenarioOneAndActual,
        dataForScenarioTwoAndActual,
      );
    const impactTable: ScenarioVsScenarioImpactTable = this.buildImpactTable(
      dto,
      indicators,
      processedScenarioVsScenarioData,
      paginatedEntities.entities,
    );

    this.sortEntitiesByImpactOfYear(
      impactTable,
      dto.sortingYear,
      dto.sortingOrder,
    );

    return {
      data: impactTable,
      metadata: paginatedEntities.metadata,
    };
  }

  private buildImpactTable(
    queryDto: GetScenarioVsScenarioImpactTableDto,
    indicators: Indicator[],
    dataForImpactTable: ScenarioVsScenarioImpactTableData[],
    entityTree: ImpactTableEntityType[],
  ): ScenarioVsScenarioImpactTable {
    this.logger.log('Building Impact Table...');
    const { groupBy, startYear, endYear } = queryDto;

    const auxIndicatorMap: Map<string, Indicator> = new Map(
      indicators.map((value: Indicator) => [value.id, value]),
    );

    // Create a range of years by start and endYears
    const rangeOfYears: number[] = range(startYear, endYear + 1);

    //Auxiliary structure in order to avoid scanning the whole table more than once
    const [indicatorEntityMap, lastYearWithData]: [
      ImpactDataTableAuxMap<ScenarioVsScenarioImpactTableRowsValues>,
      number,
    ] = BaseImpactService.impactTableDataArrayToAuxMapV2<
      ScenarioVsScenarioImpactTableData,
      ScenarioVsScenarioImpactTableRowsValues
    >(dataForImpactTable, this.createScenarioVsScenarioRowValuesFromImpactData);

    // construct result impact Table
    const impactTable: ScenarioVsScenarioImpactTableDataByIndicator[] = [];

    for (const [indicatorId, entityMap] of indicatorEntityMap.entries()) {
      const indicator: Indicator = auxIndicatorMap.get(
        indicatorId,
      ) as Indicator;
      const impactTableDataByIndicator: ScenarioVsScenarioImpactTableDataByIndicator =
        this.createScenarioVsScenarioImpactTableDataByIndicator(
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
      const impactTableEntitySkeleton: ScenarioVsScenarioImpactTableRows[] =
        this.buildScenarioVsScenarioImpactTableRowsSkeleton(entityTree);

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
   * @description Recursive function that populates and returns
   * aggregated data of parent entity and all its children
   */
  private populateValuesRecursively(
    entity: ScenarioVsScenarioImpactTableRows,
    entityDataMap: Map<
      string,
      Map<number, ScenarioVsScenarioImpactTableRowsValues>
    >,
    rangeOfYears: number[],
  ): ScenarioVsScenarioImpactTableRowsValues[] {
    entity.values = [];
    for (const year of rangeOfYears) {
      const rowsValues: ScenarioVsScenarioImpactTableRowsValues = {
        year: year,
        baseScenarioValue: 0,
        comparedScenarioValue: 0,
        absoluteDifference: 0,
        percentageDifference: 0,
        isProjected: false,
      };
      entity.values.push(rowsValues);
    }

    const valuesToAggregate: ScenarioVsScenarioImpactTableRowsValues[][] = [];
    const selfData:
      | Map<number, ScenarioVsScenarioImpactTableRowsValues>
      | undefined = entityDataMap.get(entity.name);
    if (selfData) {
      const sortedSelfData: ScenarioVsScenarioImpactTableRowsValues[] =
        Array.from(selfData.values()).sort(
          BaseImpactService.sortRowValueByYear,
        );
      valuesToAggregate.push(sortedSelfData);
    }

    entity.children.forEach(
      (childEntity: ScenarioVsScenarioImpactTableRows) => {
        //first aggregate data of child entity and then add returned value for parents aggregation
        const childValues: ScenarioVsScenarioImpactTableRowsValues[] =
          this.populateValuesRecursively(
            childEntity,
            entityDataMap,
            rangeOfYears,
          );
        valuesToAggregate.push(childValues);
      },
    );

    for (const [valueIndex, entityRowValue] of entity.values.entries()) {
      for (const valueToAggregate of valuesToAggregate) {
        entityRowValue.baseScenarioValue +=
          valueToAggregate[valueIndex].baseScenarioValue;
        entityRowValue.comparedScenarioValue +=
          valueToAggregate[valueIndex].comparedScenarioValue;
        entityRowValue.isProjected =
          valueToAggregate[valueIndex].isProjected ||
          entityRowValue.isProjected;

        entityRowValue.absoluteDifference =
          entityRowValue.comparedScenarioValue -
          entityRowValue.baseScenarioValue;
        entityRowValue.percentageDifference =
          ((entityRowValue.comparedScenarioValue -
            entityRowValue.baseScenarioValue) /
            ((entityRowValue.comparedScenarioValue +
              entityRowValue.baseScenarioValue) /
              2)) *
          100;
      }
    }
    return entity.values;
  }

  private buildScenarioVsScenarioImpactTableRowsSkeleton(
    entities: ImpactTableEntityType[],
  ): ScenarioVsScenarioImpactTableRows[] {
    return entities.map((item: ImpactTableEntityType) => {
      return {
        name: item.name || '',
        children:
          item.children.length > 0
            ? this.buildScenarioVsScenarioImpactTableRowsSkeleton(item.children)
            : [],
        values: [],
      };
    });
  }

  private static processTwoScenariosData(
    dataForScenarioOne: ImpactTableData[],
    dataForScenarioTwo: ImpactTableData[],
  ): ScenarioVsScenarioImpactTableData[] {
    const processedDataForScenarioOneAndActual: ActualVsScenarioImpactTableData[] =
      ScenarioVsScenarioImpactService.processDataForComparison(
        dataForScenarioOne,
      );
    const processedDataForScenarioTwoAndActual: ActualVsScenarioImpactTableData[] =
      ScenarioVsScenarioImpactService.processDataForComparison(
        dataForScenarioTwo,
      );

    const scenarioOneDataForScenarioComparison: ScenarioVsScenarioImpactTableData[] =
      processedDataForScenarioOneAndActual.map((scenarioData: any) => {
        scenarioData.scenarioOneImpact = scenarioData.scenarioImpact;
        scenarioData.scenarioTwoImpact = 0;
        delete scenarioData.scenarioImpact;
        return scenarioData;
      });
    const scenarioTwoDataForScenarioComparison: ScenarioVsScenarioImpactTableData[] =
      processedDataForScenarioTwoAndActual.map((scenarioData: any) => {
        scenarioData.scenarioOneImpact = 0;
        scenarioData.scenarioTwoImpact = scenarioData.scenarioImpact;
        delete scenarioData.scenarioImpact;
        return scenarioData;
      });

    return this.mergeTwoScenariosDataV2(
      scenarioOneDataForScenarioComparison,
      scenarioTwoDataForScenarioComparison,
    );
  }

  private static mergeTwoScenariosDataV2(
    scenarioOneData: ScenarioVsScenarioImpactTableData[],
    scenarioTwoData: ScenarioVsScenarioImpactTableData[],
  ): ScenarioVsScenarioImpactTableData[] {
    const bothScenarios: ScenarioVsScenarioImpactTableData[] =
      scenarioOneData.concat(scenarioTwoData);

    const resultMap: Map<string, ScenarioVsScenarioImpactTableData> = new Map();

    for (const data of bothScenarios) {
      const existingData: ScenarioVsScenarioImpactTableData | undefined =
        resultMap.get(BaseImpactService.getImpactTableDataKey(data));

      if (existingData) {
        existingData.scenarioOneImpact += data.scenarioOneImpact;
        existingData.scenarioTwoImpact += data.scenarioTwoImpact;
      } else {
        resultMap.set(BaseImpactService.getImpactTableDataKey(data), data);
      }
    }

    return Array.from(resultMap.values());
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
    entityMap: Map<
      string,
      Map<number, ScenarioVsScenarioImpactTableRowsValues>
    >,
    rangeOfYears: number[],
    lastYearWithData: number,
  ): void {
    for (const yearMap of entityMap.values()) {
      const auxYearValues: number[] = [];
      const auxYearScenarioValues: number[] = [];

      for (const [index, year] of rangeOfYears.entries()) {
        let dataForYear: ScenarioVsScenarioImpactTableRowsValues | undefined =
          yearMap.get(year);

        //If the year requested by the users exist in the raw data, append its value. There will always be a first valid value to start with
        if (!dataForYear) {
          // If the year requested does no exist in the raw data, project its value getting the latest value (previous year which comes in ascendant order)
          const isProjected: boolean = year > lastYearWithData;

          const lastYearsBaseScenarioValue: number =
            index > 0 ? auxYearValues[index - 1] : 0;
          const lastYearsComparedScenarioValue: number =
            index > 0 ? auxYearScenarioValues[index - 1] || 0 : 0;
          const baseScenarioValue: number =
            lastYearsBaseScenarioValue +
            (lastYearsBaseScenarioValue * this.growthRate) / 100;
          const comparedScenarioValue: number =
            lastYearsComparedScenarioValue +
            (lastYearsComparedScenarioValue * this.growthRate) / 100;

          dataForYear = {
            year: year,
            baseScenarioValue,
            comparedScenarioValue,
            absoluteDifference: 0,
            percentageDifference: 0,
            isProjected,
          };
          yearMap.set(year, dataForYear);
        }

        auxYearValues.push(dataForYear.baseScenarioValue || 0);
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
    entityMap: Map<
      string,
      Map<number, ScenarioVsScenarioImpactTableRowsValues>
    >,
    rangeOfYears: number[],
    lastYearWithData: number,
  ): ScenarioVsScenarioIndicatorSumByYearData[] {
    const baseScenarioYearSumMap: Map<number, number> = new Map();
    const comparedScenarioYearSumMap: Map<number, number> = new Map();

    //Iterate over the entities to aggregate the year totals
    for (const dataByYearMap of entityMap.values()) {
      for (const year of rangeOfYears) {
        const dataByYear: ScenarioVsScenarioImpactTableRowsValues =
          dataByYearMap.get(year) as ScenarioVsScenarioImpactTableRowsValues;

        const yearSum: number =
          (baseScenarioYearSumMap.get(year) || 0) +
          (dataByYear.baseScenarioValue || 0);
        const yearInterventionSum: number =
          (comparedScenarioYearSumMap.get(year) || 0) +
          (dataByYear.comparedScenarioValue || 0);

        baseScenarioYearSumMap.set(year, yearSum);
        comparedScenarioYearSumMap.set(year, yearInterventionSum);
      }
    }

    //Return the result Array from the year total Maps
    return rangeOfYears.map((year: number) => {
      const baseScenarioTotalSumByYear: number =
        baseScenarioYearSumMap.get(year) || 0;
      const comparedScenarioTotalSumByYear: number =
        comparedScenarioYearSumMap.get(year) || 0;

      return {
        year,
        baseScenarioValue: baseScenarioTotalSumByYear,
        comparedScenarioValue: comparedScenarioTotalSumByYear,
        absoluteDifference:
          comparedScenarioTotalSumByYear - (baseScenarioTotalSumByYear || 0),
        percentageDifference:
          ((comparedScenarioTotalSumByYear -
            (baseScenarioTotalSumByYear || 0)) /
            ((comparedScenarioTotalSumByYear +
              (baseScenarioTotalSumByYear || 0)) /
              2)) *
          100,
        isProjected: year > lastYearWithData,
      };
    });
  }

  // For all indicators, entities are sorted by the value of the given sortingYear, in the order given by sortingOrder
  private sortEntitiesByImpactOfYear(
    impactTable: ScenarioVsScenarioImpactTable,
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
    rows: ScenarioVsScenarioImpactTableRows[],
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
        a: ScenarioVsScenarioImpactTableRows,
        b: ScenarioVsScenarioImpactTableRows,
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
    row: ScenarioVsScenarioImpactTableRows,
    year: number,
  ): number {
    const yearValue: ScenarioVsScenarioImpactTableRowsValues | undefined =
      row.values.find(
        (value: ScenarioVsScenarioImpactTableRowsValues) => value.year === year,
      );

    return yearValue ? yearValue.absoluteDifference : 0;
  }

  private createScenarioVsScenarioImpactTableDataByIndicator(
    indicator: Indicator,
    groupBy: string,
  ): ScenarioVsScenarioImpactTableDataByIndicator {
    return {
      indicatorShortName: indicator.shortName as string,
      indicatorId: indicator.id,
      groupBy: groupBy,
      rows: [],
      yearSum: [],
      metadata: { unit: indicator.unit.symbol },
    };
  }

  private createScenarioVsScenarioRowValuesFromImpactData(
    data: ScenarioVsScenarioImpactTableData,
  ): ScenarioVsScenarioImpactTableRowsValues {
    return {
      year: data.year,
      baseScenarioValue: data.scenarioOneImpact,
      comparedScenarioValue: data.scenarioTwoImpact,
      absoluteDifference: 0,
      percentageDifference: 0,
      isProjected: false,
    };
  }
}

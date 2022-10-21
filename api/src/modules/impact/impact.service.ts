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

    const dataForImpactTable: ImpactTableData[] =
      await this.getDataForImpactTable(
        impactTableDto,
        paginatedEntities.entities,
      );

    if (impactTableDto.scenarioId) {
      const dataForImpactTableWithScenario: ImpactTableData[] =
        ImpactService.processImpactDataWithScenario(dataForImpactTable);

      const impactTableWithScenario: ImpactTable = this.buildImpactTable(
        impactTableDto,
        indicators,
        dataForImpactTableWithScenario,
        this.buildImpactTableRowsSkeleton(paginatedEntities.entities),
      );

      return {
        data: impactTableWithScenario,
        metadata: paginatedEntities.metadata,
      };
    }

    const impactTable: ImpactTable = this.buildImpactTable(
      impactTableDto,
      indicators,
      dataForImpactTable,
      this.buildImpactTableRowsSkeleton(paginatedEntities.entities),
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
    const dataForImpactTable: ImpactTableData[] =
      await this.getDataForImpactTable(rankedImpactTableDto, entities);

    if (rankedImpactTableDto.scenarioId) {
      const dataForImpactTableWithScenario: ImpactTableData[] =
        ImpactService.processImpactDataWithScenario(dataForImpactTable);

      const impactTableWithScenario: ImpactTable = this.buildImpactTable(
        rankedImpactTableDto,
        indicators,
        dataForImpactTableWithScenario,
        this.buildImpactTableRowsSkeleton(entities),
      );

      return await this.applyRankingProcessing(
        rankedImpactTableDto,
        impactTableWithScenario,
      );
    }

    const impactTable: ImpactTable = this.buildImpactTable(
      rankedImpactTableDto,
      indicators,
      dataForImpactTable,
      this.buildImpactTableRowsSkeleton(entities),
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
              value: dataForYear.impact || 0,
              isProjected: false,
            });
            // If the year requested does no exist in the raw data, project its value getting the latest value (previous year which comes in ascendant order)
          } else {
            const lastYearsValue: number =
              rowValuesIndex > 0
                ? calculatedData[namesByIndicatorIndex].values[
                    rowValuesIndex - 1
                  ].value
                : 0;

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

      impactTable[indicatorValuesIndex].rows = skeleton;
    });
    const purchasedTonnes: ImpactTablePurchasedTonnes[] =
      this.getTotalPurchasedVolumeByYear(rangeOfYears, dataForImpactTable);
    this.logger.log('Impact Table built');

    return { impactTable, purchasedTonnes };
  }

  private getTotalPurchasedVolumeByYear(
    rangeOfYears: number[],
    dataForImpactTable: ImpactTableData[],
    scenarioId?: string,
  ): ImpactTablePurchasedTonnes[] {
    const purchasedTonnes: ImpactTablePurchasedTonnes[] = [];
    rangeOfYears.forEach((year: number) => {
      const valueOfPurchasedTonnesByYear: number = dataForImpactTable.reduce(
        (accumulator: number, currentValue: ImpactTableData): number => {
          if (currentValue.year === year) {
            accumulator += Number.isFinite(+currentValue.tonnes)
              ? +currentValue.tonnes // TODO!!!!!!!!!!!!!!!!!!
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
        // TODO: this is hotfix for situations where we receive a start year for which we don't have data
        const previousYearTonnage: number =
          purchasedTonnes.length > 0
            ? purchasedTonnes[purchasedTonnes.length - 1].value
            : 0;
        const tonnesToProject: number =
          dataForImpactTable.length > 0 ? previousYearTonnage : 0;
        purchasedTonnes.push({
          year,
          value: tonnesToProject + (tonnesToProject * this.growthRate) / 100,
          isProjected: true,
        });
      }
    });
    if (scenarioId)
      purchasedTonnes.map((el: ImpactTablePurchasedTonnes) => (el.value /= 2));

    return purchasedTonnes;
  }

  /**
   * @description Recursive function that populates and returns
   * aggregated data of parent entity and all its children
   */
  private populateValuesRecursively(
    entity: ImpactTableRows,
    calculatedRows: ImpactTableRows[],
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
          scenarioId,
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
          realData.impact = realData.impact
            ? realData.impact + scenarioData.impact
            : 0;
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

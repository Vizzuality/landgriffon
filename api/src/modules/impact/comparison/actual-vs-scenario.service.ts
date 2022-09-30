import { Injectable, Logger } from '@nestjs/common';
import {
  GetActualVsScenarioImpactTableDto,
  GetImpactTableDto,
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
import { PaginatedEntitiesDto } from 'modules/impact/dto/paginated-entities.dto';
import { GetMaterialTreeWithOptionsDto } from 'modules/materials/dto/get-material-tree-with-options.dto';
import { LOCATION_TYPES } from 'modules/sourcing-locations/sourcing-location.entity';
import { PaginationMeta } from 'utils/app-base.service';

@Injectable()
export class ActualVsScenarioImpactService {
  //TODO: Hack to set a expected growing rate. This needs to be stored in the DB in the future
  growthRate: number = 1.5;
  logger: Logger = new Logger(ActualVsScenarioImpactService.name);

  constructor(
    private readonly indicatorService: IndicatorsService,
    private readonly businessUnitsService: BusinessUnitsService,
    private readonly adminRegionsService: AdminRegionsService,
    private readonly suppliersService: SuppliersService,
    private readonly materialsService: MaterialsService,
    private readonly sourcingRecordService: SourcingRecordsService,
  ) {}

  async getActualVsScenarioImpactTable(
    actualVsScenarioImpactTableDto: GetActualVsScenarioImpactTableDto,
    fetchSpecification: FetchSpecification,
  ): Promise<PaginatedImpactTable> {
    const indicators: Indicator[] =
      await this.indicatorService.getIndicatorsById(
        actualVsScenarioImpactTableDto.indicatorIds,
      );
    this.logger.log('Retrieving data from DB to build Impact Table...');

    //Getting Descendants Ids for the filters, in case Parent Ids were received
    await this.loadDescendantEntityIds(actualVsScenarioImpactTableDto);

    // Get full entity tree in case ids are not passed, otherwise get trees based on
    // given ids and add children and parent ids to them to get full data for aggregations
    const entities: ImpactTableEntityType[] =
      await this.getScenarioAndActualEntityTrees(
        actualVsScenarioImpactTableDto,
      );

    const paginatedEntities: PaginatedEntitiesDto =
      ActualVsScenarioImpactService.paginateRootEntities(
        entities,
        fetchSpecification,
      );

    this.updateGroupByCriteriaFromEntityTree(
      actualVsScenarioImpactTableDto,
      paginatedEntities.entities,
    );

    const dataForActualVsScenarioImpactTable: ImpactTableData[] =
      await this.getDataForActualVsScenarioImpactTable(
        actualVsScenarioImpactTableDto,
        paginatedEntities.entities,
      );

    const processedDataForComparison: ActualVsScenarioImpactTableData[] =
      ActualVsScenarioImpactService.processDataForComparison(
        dataForActualVsScenarioImpactTable,
      );

    const impactTable: ImpactTable = this.buildActualVsScenarioImpactTable(
      actualVsScenarioImpactTableDto,
      indicators,
      processedDataForComparison,
      this.buildActualVsScenarioImpactTableRowsSkeleton(
        paginatedEntities.entities,
      ),
    );

    return { data: impactTable, metadata: paginatedEntities.metadata };
  }

  /**
   * @description: Modifies the ImpactTabledto such that, for each entityIds that is populated,
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
   * Returns an array of ImpactTable Entities, determined by the grouBy field and properties
   * of the GetImpactTableDto
   * @param getActualVsScenarioImpactTableDto
   * @private
   */
  private async getScenarioAndActualEntityTrees(
    getActualVsScenarioImpactTableDto: GetActualVsScenarioImpactTableDto,
  ): Promise<ImpactTableEntityType[]> {
    const treeOptions: GetMaterialTreeWithOptionsDto = {
      ...(getActualVsScenarioImpactTableDto.materialIds && {
        materialIds: getActualVsScenarioImpactTableDto.materialIds,
      }),
      ...(getActualVsScenarioImpactTableDto.originIds && {
        originIds: getActualVsScenarioImpactTableDto.originIds,
      }),
      ...(getActualVsScenarioImpactTableDto.supplierIds && {
        supplierIds: getActualVsScenarioImpactTableDto.supplierIds,
      }),
      ...(getActualVsScenarioImpactTableDto.scenarioId && {
        scenarioId: getActualVsScenarioImpactTableDto.scenarioId,
      }),
    };
    switch (getActualVsScenarioImpactTableDto.groupBy) {
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
          impactTableDto.materialIds,
        );
        break;
      default:
    }
  }

  private getDataForActualVsScenarioImpactTable(
    actualVsScenarioImpactTableDto: GetActualVsScenarioImpactTableDto,
    entities: ImpactTableEntityType[],
  ): Promise<ActualVsScenarioImpactTableData[]> {
    return entities.length > 0
      ? this.sourcingRecordService.getDataForActualVsScebarioImpactTable(
          actualVsScenarioImpactTableDto,
        )
      : Promise.resolve([]);
  }

  private buildActualVsScenarioImpactTable(
    queryDto: GetActualVsScenarioImpactTableDto,
    indicators: Indicator[],
    dataForActualVsScenarioImpactTable: ActualVsScenarioImpactTableData[],
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
      const dataByIndicator: ActualVsScenarioImpactTableData[] =
        dataForActualVsScenarioImpactTable.filter(
          (data: ActualVsScenarioImpactTableData) =>
            data.indicatorId === indicator.id,
        );
      // Get unique entity names for aggregations from raw data
      const namesByIndicator: string[] = [
        ...new Set(
          dataByIndicator.map((el: ActualVsScenarioImpactTableData) => el.name),
        ),
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
          const dataForYear: ActualVsScenarioImpactTableData | undefined =
            dataByIndicator.find(
              (data: ActualVsScenarioImpactTableData) =>
                data.year === year && data.name === name,
            );
          //If the year requested by the users exist in the raw data, append its value. There will always be a first valid value to start with
          if (dataForYear) {
            calculatedData[namesByIndicatorIndex].values.push({
              year: dataForYear.year,
              value: dataForYear.impact,
              scenarioValue: dataForYear.scenarioImpact,
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
            const lastYearsInterventionValue: number =
              rowValuesIndex > 0
                ? calculatedData[namesByIndicatorIndex].values[
                    rowValuesIndex - 1
                  ].scenarioValue || 0
                : 0;
            calculatedData[namesByIndicatorIndex].values.push({
              year: year,
              value: lastYearsValue + (lastYearsValue * this.growthRate) / 100,
              scenarioValue:
                lastYearsInterventionValue +
                (lastYearsInterventionValue * this.growthRate) / 100,
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

        let totalScenarioSumByYear: number | null = null;

        totalScenarioSumByYear = calculatedData.reduce(
          (accumulator: number, currentValue: ImpactTableRows): number => {
            if (currentValue.values[indexOfYear].year === year)
              accumulator += Number.isFinite(
                currentValue.values[indexOfYear].scenarioValue,
              )
                ? currentValue.values[indexOfYear].scenarioValue || 0
                : 0;
            return accumulator;
          },
          0,
        );

        const yearData: ImpactTableRowsValues | undefined =
          calculatedData[0].values.find(
            (tableRowValue: ImpactTableRowsValues) => {
              return tableRowValue.year === year;
            },
          );

        impactTable[indicatorValuesIndex].yearSum.push({
          year,
          value: totalSumByYear,
          scenarioValue: totalScenarioSumByYear || 0,
          absoluteDifference: (totalScenarioSumByYear || 0) - totalSumByYear,
          percentageDifference:
            ((totalScenarioSumByYear || 0 - totalSumByYear) / totalSumByYear) *
            100,
          isProjected: yearData?.isProjected,
        });
      });
      // copy and populate tree skeleton for each indicator
      const skeleton: ImpactTableRows[] = JSON.parse(JSON.stringify(entities));
      skeleton.forEach((entity: any) => {
        this.populateValuesRecursively(entity, calculatedData, rangeOfYears);
      });

      impactTable[indicatorValuesIndex].rows = queryDto.scenarioId
        ? skeleton
        : skeleton.filter(
            (item: ImpactTableRows) =>
              item.children.length > 0 || item.values[0].value > 0,
          );
    });
    const purchasedTonnes: ImpactTablePurchasedTonnes[] =
      this.getTotalPurchasedVolumeByYear(
        rangeOfYears,
        dataForActualVsScenarioImpactTable,
      );
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
  ): ImpactTableRowsValues[] {
    entity.values = [];
    for (const year of rangeOfYears) {
      entity.values.push({
        year: year,
        value: 0,
        scenarioValue: 0,
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

        entity.values[valueIndex].scenarioValue =
          (ImpactTableRowsValues.scenarioValue ?? 0) +
          (item[valueIndex].scenarioValue || 0);
        entity.values[valueIndex].absoluteDifference =
          (entity.values[valueIndex].scenarioValue || 0) -
          entity.values[valueIndex].value;
        entity.values[valueIndex].percentageDifference =
          (((entity.values[valueIndex].scenarioValue || 0) -
            entity.values[valueIndex].value) /
            entity.values[valueIndex].value) *
          100;
      });
    }
    return entity.values;
  }

  private buildActualVsScenarioImpactTableRowsSkeleton(
    entities: ImpactTableEntityType[],
  ): ImpactTableRows[] {
    return entities.map((item: ImpactTableEntityType) => {
      return {
        name: item.name || '',
        children:
          item.children.length > 0
            ? this.buildActualVsScenarioImpactTableRowsSkeleton(item.children)
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

  private static processDataForComparison(
    dataForActualVsScenarioImpactTable: ImpactTableData[],
  ): ActualVsScenarioImpactTableData[] {
    const result: ActualVsScenarioImpactTableData[] = [];

    // Geting array with sourcing data  for real existing locations
    const realSourcingData: ActualVsScenarioImpactTableData[] =
      dataForActualVsScenarioImpactTable.filter((el: ImpactTableData) => {
        return el.typeByIntervention === null;
      });

    // Geting array with sourcing data for locations created by Scenario
    const scenarioSourcingData: ImpactTableData[] =
      dataForActualVsScenarioImpactTable.filter((el: ImpactTableData) => {
        return el.typeByIntervention !== null;
      });

    // By default, if real sourcing data is not affected by scenario - we assume that real impact and scenario impact are the same

    realSourcingData.map((data: ActualVsScenarioImpactTableData) => {
      return (data.scenarioImpact = data.impact);
    });

    // Start iterating real data to check if it has been affected by Scenario and calculating scenarioImpact
    realSourcingData.forEach((realData: ActualVsScenarioImpactTableData) => {
      scenarioSourcingData.forEach(
        (scenarioData: ActualVsScenarioImpactTableData) => {
          if (
            scenarioData.name === realData.name &&
            scenarioData.year === realData.year &&
            scenarioData.typeByIntervention !== null
          ) {
            realData.scenarioImpact = realData.scenarioImpact
              ? realData.scenarioImpact + scenarioData.impact
              : 0;
          }
        },
      );
      result.push(realData);
    });

    /**
     * We need to check if some of the scenario data has no real data
     * (for example, if scenario objective is to use a new material that has never been purchased before, so there is no 'real' data for this material)
     * In that case impact value (actual or real impact, without Scenario, should be 0)*/

    scenarioSourcingData.forEach(
      (scenarioData: ActualVsScenarioImpactTableData) => {
        const realDataForEntitties:
          | ActualVsScenarioImpactTableData
          | undefined = realSourcingData.find(
          (realData: ActualVsScenarioImpactTableData) => {
            return (
              realData.year === scenarioData.year &&
              realData.name === scenarioData.name
            );
          },
        );

        if (!realDataForEntitties) {
          scenarioData.scenarioImpact = scenarioData.impact;
          scenarioData.impact = 0;

          result.push(scenarioData);
        }
      },
    );

    return result;
  }
}

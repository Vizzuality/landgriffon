import { Injectable, Logger } from '@nestjs/common';
import {
  GetActualVsScenarioImpactTableDto,
  GetImpactTableDto,
  GetScenarioVsScenarioImpactTableDto,
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
import { GROUP_BY_VALUES } from 'modules/h3-data/dto/get-impact-map.dto';
import { ImpactTableEntityType } from 'types/impact-table-entity.type';
import { DEFAULT_PAGINATION, FetchSpecification } from 'nestjs-base-service';
import { PaginatedEntitiesDto } from 'modules/impact/dto/paginated-entities.dto';
import { GetMaterialTreeWithOptionsDto } from 'modules/materials/dto/get-material-tree-with-options.dto';
import { LOCATION_TYPES } from 'modules/sourcing-locations/sourcing-location.entity';
import { PaginationMeta } from 'utils/app-base.service';
import {
  ScenarioVsScenarioImpactTable,
  ScenarioVsScenarioImpactTableDataByIndicator,
  ScenarioVsScenarioImpactTablePurchasedTonnes,
  ScenarioVsScenarioImpactTableRows,
  ScenarioVsScenarioImpactTableRowsValues,
  ScenarioVsScenarioPaginatedImpactTable,
} from 'modules/impact/dto/response-scenario-scenario.dto';

@Injectable()
export class ScenarioVsScenarioImpactService {
  //TODO: Hack to set a expected growing rate. This needs to be stored in the DB in the future
  growthRate: number = 1.5;
  logger: Logger = new Logger(ScenarioVsScenarioImpactService.name);

  constructor(
    private readonly indicatorService: IndicatorsService,
    private readonly businessUnitsService: BusinessUnitsService,
    private readonly adminRegionsService: AdminRegionsService,
    private readonly suppliersService: SuppliersService,
    private readonly materialsService: MaterialsService,
    private readonly sourcingRecordService: SourcingRecordsService,
  ) {}

  async getScenarioVsScenarioImpactTable(
    scenarioVsScenarioImpactTableDto: GetScenarioVsScenarioImpactTableDto,
    fetchSpecification: FetchSpecification,
  ): Promise<ScenarioVsScenarioPaginatedImpactTable> {
    const indicators: Indicator[] =
      await this.indicatorService.getIndicatorsById(
        scenarioVsScenarioImpactTableDto.indicatorIds,
      );
    this.logger.log('Retrieving data from DB to build Impact Table...');

    //Getting Descendants Ids for the filters, in case Parent Ids were received
    await this.loadDescendantEntityIds(scenarioVsScenarioImpactTableDto);

    // Getting entities and processing that correspond to Scenario 1 and filtered actual data

    const entities: ImpactTableEntityType[] =
      await this.getScenariosEntityTrees(scenarioVsScenarioImpactTableDto);

    const paginatedEntities: PaginatedEntitiesDto =
      ScenarioVsScenarioImpactService.paginateRootEntities(
        entities,
        fetchSpecification,
      );

    this.updateGroupByCriteriaFromEntityTree(
      scenarioVsScenarioImpactTableDto,
      paginatedEntities.entities,
    );

    // Getting and proceesing impact data separetely for each scenario for further merge

    const { baseScenarioId, comparedScenarioId, ...generalDto } =
      scenarioVsScenarioImpactTableDto;

    const scenarioOneDto: GetActualVsScenarioImpactTableDto = {
      comparedScenarioId: baseScenarioId,
      ...generalDto,
    };

    const scenarioTwoDto: GetActualVsScenarioImpactTableDto = {
      comparedScenarioId: comparedScenarioId,
      ...generalDto,
    };

    const dataForScenarioOneAndActual: ImpactTableData[] =
      await this.getDataForActualVsScenarioImpactTable(
        scenarioOneDto,
        paginatedEntities.entities,
      );

    const dataForScenarioTwoAndActual: ImpactTableData[] =
      await this.getDataForActualVsScenarioImpactTable(
        scenarioTwoDto,
        paginatedEntities.entities,
      );

    const processedScenarioVsScenarioData: ScenarioVsScenarioImpactTableData[] =
      ScenarioVsScenarioImpactService.processTwoScenariosData(
        dataForScenarioOneAndActual,
        dataForScenarioTwoAndActual,
      );

    const scenarioVsScenarioImpactTable: ScenarioVsScenarioImpactTable =
      this.buildScenarioVsScenarioImpactTable(
        scenarioVsScenarioImpactTableDto,
        indicators,
        processedScenarioVsScenarioData,
        this.buildScenarioVsScenarioImpactTableRowsSkeleton(
          paginatedEntities.entities,
        ),
      );

    return {
      data: scenarioVsScenarioImpactTable,
      metadata: paginatedEntities.metadata,
    };
  }

  /**
   * Modifies the ImpactTabledto such that, for each entityIds that is populated,
   * the ids of their descendants are added, in-place
   * @param impactTableDto
   * @private
   */
  private async loadDescendantEntityIds(
    scenarioVsScenarioImpactTableDto: GetScenarioVsScenarioImpactTableDto,
  ): Promise<GetImpactTableDto> {
    if (scenarioVsScenarioImpactTableDto.originIds)
      scenarioVsScenarioImpactTableDto.originIds =
        await this.adminRegionsService.getAdminRegionDescendants(
          scenarioVsScenarioImpactTableDto.originIds,
        );
    if (scenarioVsScenarioImpactTableDto.materialIds)
      scenarioVsScenarioImpactTableDto.materialIds =
        await this.materialsService.getMaterialsDescendants(
          scenarioVsScenarioImpactTableDto.materialIds,
        );
    if (scenarioVsScenarioImpactTableDto.supplierIds)
      scenarioVsScenarioImpactTableDto.supplierIds =
        await this.suppliersService.getSuppliersDescendants(
          scenarioVsScenarioImpactTableDto.supplierIds,
        );

    return scenarioVsScenarioImpactTableDto;
  }

  /**
   * Returns an array of ScenarioVsScenarioImpactTable Entities, determined by the grouBy field and properties
   * of the GetImpactTableDto
   * @param getActualVsScenarioImpactTableDto
   * @private
   */
  private async getScenariosEntityTrees(
    getScenarioVsScenarioImpactTableDto: GetScenarioVsScenarioImpactTableDto,
  ): Promise<ImpactTableEntityType[]> {
    const treeOptions: GetMaterialTreeWithOptionsDto = {
      ...(getScenarioVsScenarioImpactTableDto.materialIds && {
        materialIds: getScenarioVsScenarioImpactTableDto.materialIds,
      }),
      ...(getScenarioVsScenarioImpactTableDto.originIds && {
        originIds: getScenarioVsScenarioImpactTableDto.originIds,
      }),
      ...(getScenarioVsScenarioImpactTableDto.supplierIds && {
        supplierIds: getScenarioVsScenarioImpactTableDto.supplierIds,
      }),

      scenarioIds: [
        getScenarioVsScenarioImpactTableDto.baseScenarioId,
        getScenarioVsScenarioImpactTableDto.comparedScenarioId,
      ],
    };
    switch (getScenarioVsScenarioImpactTableDto.groupBy) {
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

  private getDataForActualVsScenarioImpactTable(
    actualVsScenarioImpactTableDto: GetActualVsScenarioImpactTableDto,
    entities: ImpactTableEntityType[],
  ): Promise<ActualVsScenarioImpactTableData[]> {
    return entities.length > 0
      ? this.sourcingRecordService.getDataForActualVsScenarioImpactTable(
          actualVsScenarioImpactTableDto,
        )
      : Promise.resolve([]);
  }

  private buildScenarioVsScenarioImpactTable(
    queryDto: GetScenarioVsScenarioImpactTableDto,
    indicators: Indicator[],
    dataForScenarioVsScenarioImpactTable: ScenarioVsScenarioImpactTableData[],
    entities: ScenarioVsScenarioImpactTableRows[],
  ): ScenarioVsScenarioImpactTable {
    this.logger.log('Building Impact Table...');
    const { groupBy, startYear, endYear } = queryDto;
    const scenarioVsScenarioImpactTable: ScenarioVsScenarioImpactTableDataByIndicator[] =
      [];
    // Create a range of years by start and endYears
    const rangeOfYears: number[] = range(startYear, endYear + 1);
    const lastYearWithData: number = Math.max(
      ...dataForScenarioVsScenarioImpactTable.map(
        (el: ImpactTableData) => el.year,
      ),
    );
    // Append data by indicator and add its unit.symbol as metadata. We need awareness of this loop during the whole process
    indicators.forEach((indicator: Indicator, indicatorValuesIndex: number) => {
      const calculatedData: ScenarioVsScenarioImpactTableRows[] = [];
      scenarioVsScenarioImpactTable.push({
        indicatorShortName: indicator.shortName as string,
        indicatorId: indicator.id,
        groupBy: groupBy,
        rows: [],
        yearSum: [],
        metadata: { unit: indicator.unit.symbol },
      });
      // Filter the raw data by Indicator
      const dataByIndicator: ScenarioVsScenarioImpactTableData[] =
        dataForScenarioVsScenarioImpactTable.filter(
          (data: ScenarioVsScenarioImpactTableData) =>
            data.indicatorId === indicator.id,
        );
      // Get unique entity names for aggregations from raw data
      const namesByIndicator: string[] = [
        ...new Set(
          dataByIndicator.map(
            (el: ScenarioVsScenarioImpactTableData) => el.name,
          ),
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
          const dataForYear: ScenarioVsScenarioImpactTableData | undefined =
            dataByIndicator.find(
              (data: ScenarioVsScenarioImpactTableData) =>
                data.year === year && data.name === name,
            );
          //If the year requested by the users exist in the raw data, append its value. There will always be a first valid value to start with
          if (dataForYear) {
            calculatedData[namesByIndicatorIndex].values.push({
              year: dataForYear.year,
              baseScenarioValue: dataForYear.scenarioOneImpact,
              comparedScenarioValue: dataForYear.scenarioTwoImpact,
              isProjected: false,
            });
            // If the year requested does no exist in the raw data, project its value getting the latest value (previous year which comes in ascendant order)
          } else {
            const lastYearsBaseScenarioValue: number =
              rowValuesIndex > 0
                ? calculatedData[namesByIndicatorIndex].values[
                    rowValuesIndex - 1
                  ].baseScenarioValue || 0
                : 0;
            const lastYearsComparedScenarioValue: number =
              rowValuesIndex > 0
                ? calculatedData[namesByIndicatorIndex].values[
                    rowValuesIndex - 1
                  ].comparedScenarioValue || 0
                : 0;
            const isProjected: boolean = year > lastYearWithData;
            calculatedData[namesByIndicatorIndex].values.push({
              year: year,
              baseScenarioValue:
                lastYearsBaseScenarioValue +
                (lastYearsBaseScenarioValue * this.growthRate) / 100,
              comparedScenarioValue:
                lastYearsComparedScenarioValue +
                (lastYearsComparedScenarioValue * this.growthRate) / 100,
              isProjected,
            });
          }
          ++rowValuesIndex;
        }
      }

      // Once we have all data, projected or not, append the total sum of impact by year and indicator
      rangeOfYears.forEach((year: number, indexOfYear: number) => {
        const baseScenarioTotalSumByYear: number = calculatedData.reduce(
          (
            accumulator: number,
            currentValue: ScenarioVsScenarioImpactTableRows,
          ): number => {
            if (currentValue.values[indexOfYear].year === year)
              accumulator += Number.isFinite(
                currentValue.values[indexOfYear].baseScenarioValue || 0,
              )
                ? currentValue.values[indexOfYear].baseScenarioValue || 0
                : 0;
            return accumulator;
          },
          0,
        );

        const comparedScenarioTotalSumByYear: number = calculatedData.reduce(
          (
            accumulator: number,
            currentValue: ScenarioVsScenarioImpactTableRows,
          ): number => {
            if (currentValue.values[indexOfYear].year === year)
              accumulator += Number.isFinite(
                currentValue.values[indexOfYear].comparedScenarioValue,
              )
                ? currentValue.values[indexOfYear].comparedScenarioValue || 0
                : 0;
            return accumulator;
          },
          0,
        );

        const yearData: ScenarioVsScenarioImpactTableRowsValues | undefined =
          calculatedData[0].values.find(
            (tableRowValue: ScenarioVsScenarioImpactTableRowsValues) => {
              return tableRowValue.year === year;
            },
          );

        scenarioVsScenarioImpactTable[indicatorValuesIndex].yearSum.push({
          year,
          baseScenarioValue: baseScenarioTotalSumByYear,
          comparedScenarioValue: comparedScenarioTotalSumByYear,
          absoluteDifference:
            (baseScenarioTotalSumByYear || 0) - comparedScenarioTotalSumByYear,
          percentageDifference:
            (((baseScenarioTotalSumByYear || 0) -
              comparedScenarioTotalSumByYear) /
              (((baseScenarioTotalSumByYear || 0) +
                comparedScenarioTotalSumByYear) /
                2)) *
            100,
          isProjected: yearData?.isProjected,
        });
      });
      // copy and populate tree skeleton for each indicator
      const skeleton: ScenarioVsScenarioImpactTableRows[] = JSON.parse(
        JSON.stringify(entities),
      );
      skeleton.forEach((entity: any) => {
        this.populateValuesRecursively(entity, calculatedData, rangeOfYears);
      });

      scenarioVsScenarioImpactTable[indicatorValuesIndex].rows = skeleton;
    });
    const purchasedTonnes: ScenarioVsScenarioImpactTablePurchasedTonnes[] =
      this.getTotalPurchasedVolumeByYear(
        rangeOfYears,
        dataForScenarioVsScenarioImpactTable,
        lastYearWithData,
      );
    this.logger.log('Impact Table built');

    return { impactTable: scenarioVsScenarioImpactTable, purchasedTonnes };
  }

  private getTotalPurchasedVolumeByYear(
    rangeOfYears: number[],
    dataForImpactTable: ImpactTableData[],
    lastYearWithData: number,
  ): ScenarioVsScenarioImpactTablePurchasedTonnes[] {
    const purchasedTonnes: ScenarioVsScenarioImpactTablePurchasedTonnes[] = [];

    rangeOfYears.forEach((year: number) => {
      const valueOfPurchasedTonnesByYear: number = dataForImpactTable.reduce(
        (accumulator: number, currentValue: ImpactTableData): number => {
          if (currentValue.year === year) {
            accumulator += Number.isFinite(+currentValue.tonnes)
              ? +currentValue.tonnes
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
        const isProjected: boolean = year > lastYearWithData;
        purchasedTonnes.push({
          year,
          value: tonnesToProject + (tonnesToProject * this.growthRate) / 100,
          isProjected,
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
    entity: ScenarioVsScenarioImpactTableRows,
    calculatedRows: ScenarioVsScenarioImpactTableRows[],
    rangeOfYears: number[],
  ): ScenarioVsScenarioImpactTableRowsValues[] {
    entity.values = [];
    for (const year of rangeOfYears) {
      entity.values.push({
        year: year,
        baseScenarioValue: 0,
        comparedScenarioValue: 0,
        isProjected: false,
      });
    }

    const valuesToAggregate: ScenarioVsScenarioImpactTableRowsValues[][] = [];
    const selfData: ScenarioVsScenarioImpactTableRows | undefined =
      calculatedRows.find(
        (item: ScenarioVsScenarioImpactTableRows) => item.name === entity.name,
      );
    if (selfData) valuesToAggregate.push(selfData.values);
    entity.children.forEach(
      (childEntity: ScenarioVsScenarioImpactTableRows) => {
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
      },
    );
    for (const [
      valueIndex,
      ScenarioVsScenarioImpactTableRowsValues,
    ] of entity.values.entries()) {
      valuesToAggregate.forEach(
        (item: ScenarioVsScenarioImpactTableRowsValues[]) => {
          entity.values[valueIndex].baseScenarioValue =
            (ScenarioVsScenarioImpactTableRowsValues.baseScenarioValue ?? 0) +
            (item[valueIndex].baseScenarioValue || 0);
          entity.values[valueIndex].isProjected =
            item[valueIndex].isProjected ||
            entity.values[valueIndex].isProjected;

          entity.values[valueIndex].comparedScenarioValue =
            (ScenarioVsScenarioImpactTableRowsValues.comparedScenarioValue ??
              0) + (item[valueIndex].comparedScenarioValue || 0);
          entity.values[valueIndex].absoluteDifference =
            (entity.values[valueIndex].baseScenarioValue || 0) -
            (entity.values[valueIndex].comparedScenarioValue || 0);
          entity.values[valueIndex].percentageDifference =
            (((entity.values[valueIndex].baseScenarioValue || 0) -
              (entity.values[valueIndex].comparedScenarioValue || 0)) /
              (((entity.values[valueIndex].baseScenarioValue || 0) +
                (entity.values[valueIndex].comparedScenarioValue || 0)) /
                2)) *
            100;
        },
      );
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
            scenarioData.indicatorId === realData.indicatorId &&
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

  private static processTwoScenariosData(
    dataForScenarioOne: ImpactTableData[],
    dataForScenarioTwo: ImpactTableData[],
  ): ScenarioVsScenarioImpactTableData[] {
    const processedDataForScenarioOneAndActual: ActualVsScenarioImpactTableData[] =
      ScenarioVsScenarioImpactService.processDataForComparison(
        dataForScenarioOne,
      );
    const scenarioOneDataForScenarioComparison: ScenarioVsScenarioImpactTableData[] =
      processedDataForScenarioOneAndActual.map((scenarioData: any) => {
        scenarioData.scenarioOneImpact = scenarioData.scenarioImpact;
        scenarioData.scenarioTwoImpact = 0;
        delete scenarioData.scenarioImpact;
        return scenarioData;
      });

    const processedDataForScenarioTwoAndActual: ActualVsScenarioImpactTableData[] =
      ScenarioVsScenarioImpactService.processDataForComparison(
        dataForScenarioTwo,
      );

    const scenarioTwoDataForScenarioComparison: ScenarioVsScenarioImpactTableData[] =
      processedDataForScenarioTwoAndActual.map((scenarioData: any) => {
        scenarioData.scenarioOneImpact = 0;
        scenarioData.scenarioTwoImpact = scenarioData.scenarioImpact;
        delete scenarioData.scenarioImpact;
        return scenarioData;
      });

    return this.mergeTwoScenariosData(
      scenarioOneDataForScenarioComparison,
      scenarioTwoDataForScenarioComparison,
    );
  }

  private static mergeTwoScenariosData(
    scenarioOneData: ScenarioVsScenarioImpactTableData[],
    scenarioTwoData: ScenarioVsScenarioImpactTableData[],
  ): ScenarioVsScenarioImpactTableData[] {
    const mergedScenariosData: ScenarioVsScenarioImpactTableData[] =
      scenarioOneData.concat(scenarioTwoData);

    const finalScenariosData: ScenarioVsScenarioImpactTableData[] =
      mergedScenariosData.reduce(
        (
          accumulator: ScenarioVsScenarioImpactTableData[],
          currentValue: ScenarioVsScenarioImpactTableData,
        ) => {
          const existingData: ScenarioVsScenarioImpactTableData | undefined =
            accumulator.find((item: ScenarioVsScenarioImpactTableData) => {
              return (
                item.name === currentValue.name &&
                item.year === currentValue.year &&
                item.indicatorId === currentValue.indicatorId
              );
            });

          if (existingData) {
            existingData.scenarioOneImpact =
              (existingData.scenarioOneImpact || 0) +
              (currentValue.scenarioOneImpact || 0);
            existingData.scenarioTwoImpact =
              (existingData.scenarioTwoImpact || 0) +
              (currentValue.scenarioTwoImpact || 0);
          } else {
            accumulator.push(currentValue);
          }
          return accumulator;
        },
        [],
      );

    return finalScenariosData;
  }
}

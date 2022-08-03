import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  GetImpactTableDto,
  GetRankedImpactTableDto,
} from 'modules/impact/dto/get-impact-table.dto';
import { IndicatorsService } from 'modules/indicators/indicators.service';
import { SourcingRecordsService } from 'modules/sourcing-records/sourcing-records.service';
import {
  ImpactTableData,
  ScenarioComparissonImpact,
  ScenariosImpactTableData,
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
import { SOURCING_LOCATION_TYPE_BY_INTERVENTION } from 'modules/sourcing-locations/sourcing-location.entity';
import { PaginationMeta } from 'utils/app-base.service';
import { GetScenarioComparisonDto } from './dto/get-scenario-comparison.dto';
import {
  PaginatedScenariosImpactTable,
  ScenariosImpactTable,
  ScenariosImpactTableDataByIndicator,
  ScenariosImpactTableRows,
  ScenariosImpactTableRowsValues,
} from './dto/response-comparison-table.dto';

export class ScenarioComparisonService {
  //TODO: Hack to set a expected growing rate. This needs to be stored in the DB in the future
  growthRate: number = 1.5;
  logger: Logger = new Logger(ScenarioComparisonService.name);

  constructor(
    private readonly indicatorService: IndicatorsService,
    private readonly businessUnitsService: BusinessUnitsService,
    private readonly adminRegionsService: AdminRegionsService,
    private readonly suppliersService: SuppliersService,
    private readonly materialsService: MaterialsService,
    private readonly sourcingRecordService: SourcingRecordsService,
  ) {}

  async getScenarioComparisonTable(
    scenarioComparisonDto: GetScenarioComparisonDto,
    fetchSpecification: FetchSpecification,
  ): Promise<PaginatedScenariosImpactTable> {
    const indicators: Indicator[] =
      await this.indicatorService.getIndicatorsById(
        scenarioComparisonDto.indicatorIds,
      );
    this.logger.log(
      'Retrieving data from DB to build Scenario Comparison Table...',
    );

    //Getting Descendants Ids for the filters, in case Parent Ids were received
    await this.loadDescendantEntityIds(scenarioComparisonDto);

    const entities: ImpactTableEntityType[] = await this.getEntityTree(
      scenarioComparisonDto,
    );

    const paginatedEntities: PaginatedEntitiesDto =
      ScenarioComparisonService.paginateRootEntities(
        entities,
        fetchSpecification,
      );

    this.updateGroupByCriteriaFromEntityTree(
      scenarioComparisonDto,
      paginatedEntities.entities,
    );

    const scenarioComparisonImpactData: ScenariosImpactTableData[] =
      await this.getScenarioComparisonImpactData(
        scenarioComparisonDto,
        paginatedEntities.entities,
      );

    const comparisonTable: ScenariosImpactTable =
      this.buildScenarioComparisonTable(
        scenarioComparisonDto,
        indicators,
        scenarioComparisonImpactData,
        this.buildImpactTableRowsSkeleton(paginatedEntities.entities),
      );

    return { data: comparisonTable, metadata: paginatedEntities.metadata };
  }

  /**
   * @param scenarioComparisonDto
   * Returns proceesed (grouped) Impact Data for scenarios to compare
   */
  async getScenarioComparisonImpactData(
    scenarioComparisonDto: GetScenarioComparisonDto,
    entities: ImpactTableEntityType[],
  ): Promise<ScenariosImpactTableData[]> {
    const impactDataForBothSceanrios: ImpactTableData[] =
      await this.getImapctDataForScenario(scenarioComparisonDto, entities);

    return this.groupScenarioComparisonData(impactDataForBothSceanrios);
  }

  private groupScenarioComparisonData(
    impactData: ImpactTableData[],
  ): ScenariosImpactTableData[] {
    let dataForScenarioImpactTable: ScenariosImpactTableData[] = [];

    impactData.forEach((impactData: ImpactTableData) => {
      const existingScenarioDataIndex: number =
        dataForScenarioImpactTable.findIndex((el: ImpactTableData) => {
          el.name === impactData.name && el.year === impactData.year;
        });

      if (existingScenarioDataIndex > -1) {
        dataForScenarioImpactTable[
          existingScenarioDataIndex
        ].scenarioComparison.push({
          scenarioId: impactData.scenarioId as string,
          impact: impactData.impact,
        });
      } else {
        const newComparisonData: ScenariosImpactTableData = {
          ...impactData,
          scenarioComparison: [
            {
              scenarioId: impactData.scenarioId as string,
              impact: impactData.impact,
            },
          ],
        };
        dataForScenarioImpactTable.push(newComparisonData);
      }
    });

    return dataForScenarioImpactTable;
  }

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
      ...(impactTableDto.scenarioId && {
        scenarioId: impactTableDto.scenarioId,
      }),
    };
    switch (impactTableDto.groupBy) {
      case GROUP_BY_VALUES.MATERIAL: {
        return this.materialsService.getMaterialsTreeWithSourcingLocations(
          treeOptions,
        );
      }
      case GROUP_BY_VALUES.REGION: {
        return this.adminRegionsService.getAdminRegionTreeWithSourcingLocations(
          treeOptions,
        );
      }
      case GROUP_BY_VALUES.SUPPLIER: {
        return this.suppliersService.getSuppliersWithSourcingLocations(
          treeOptions,
        );
      }
      case GROUP_BY_VALUES.BUSINESS_UNIT:
        return this.businessUnitsService.getBusinessUnitTreeWithSourcingLocations(
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

  private getImapctDataForScenario(
    scenarioComparisonDto: GetScenarioComparisonDto,
    entities: ImpactTableEntityType[],
  ): Promise<ImpactTableData[]> {
    return entities.length > 0
      ? this.sourcingRecordService.getDataForScenarioComparison(
          scenarioComparisonDto,
        )
      : Promise.resolve([]);
  }

  private buildScenarioComparisonTable(
    queryDto: GetImpactTableDto,
    indicators: Indicator[],
    dataForComparisonTable: ScenariosImpactTableData[],
    entities: ScenariosImpactTableRows[],
  ): ScenariosImpactTable {
    this.logger.log('Building Scenario Comparison Table...');
    const { groupBy, startYear, endYear } = queryDto;
    const scenariosImpactTable: ScenariosImpactTableDataByIndicator[] = [];
    // Create a range of years by start and endYears
    const rangeOfYears: number[] = range(startYear, endYear + 1);
    // Append data by indicator and add its unit.symbol as metadata. We need awareness of this loop during the whole process
    indicators.forEach((indicator: Indicator, indicatorValuesIndex: number) => {
      const calculatedData: ScenariosImpactTableRows[] = [];
      scenariosImpactTable.push({
        indicatorShortName: indicator.shortName as string,
        indicatorId: indicator.id,
        groupBy: groupBy,
        rows: [],
        yearSum: [],
        metadata: { unit: indicator.unit.symbol },
      });
      // Filter the raw data by Indicator
      const scenariosdDataByIndicator: ScenariosImpactTableData[] =
        dataForComparisonTable.filter(
          (data: ScenariosImpactTableData) => data.indicatorId === indicator.id,
        );
      // Get unique entity names for aggregations from raw data
      const namesByIndicator: string[] = [
        ...new Set(
          scenariosdDataByIndicator.map((el: ImpactTableData) => el.name),
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
          const dataForYear: ScenariosImpactTableData | undefined =
            scenariosdDataByIndicator.find(
              (data: ScenariosImpactTableData) =>
                data.year === year && data.name === name,
            );
          //If the year requested by the users exist in the raw data, append its value. There will always be a first valid value to start with
          if (dataForYear) {
            calculatedData[namesByIndicatorIndex].values.push({
              year: dataForYear.year,
              scenariosImpacts: dataForYear.scenarioComparison,
              isProjected: false,
            });
            // If the year requested does no exist in the raw data, project its value getting the latest value (previous year which comes in ascendant order)
          } else {
            const lastYearsValue: ScenarioComparissonImpact[] =
              rowValuesIndex > 0
                ? calculatedData[namesByIndicatorIndex].values[
                    rowValuesIndex - 1
                  ].scenariosImpacts
                : [{ scenarioId: 'none', impact: 0 }];

            const projectedScenariosImpacts: ScenarioComparissonImpact[] =
              lastYearsValue.map((scenarioImpact) => {
                scenarioImpact.impact =
                  scenarioImpact.impact +
                  (scenarioImpact.impact * this.growthRate) / 100;
                return scenarioImpact;
              });
            calculatedData[namesByIndicatorIndex].values.push({
              year: year,
              scenariosImpacts: projectedScenariosImpacts,
              isProjected: true,
            });
          }
          ++rowValuesIndex;
        }
      }

      // copy and populate tree skeleton for each indicator
      const skeleton: ScenariosImpactTableRows[] = JSON.parse(
        JSON.stringify(entities),
      );
      skeleton.forEach((entity: any) => {
        this.populateValuesRecursively(entity, calculatedData, rangeOfYears);
      });

      scenariosImpactTable[indicatorValuesIndex].rows = skeleton;
    });

    return { scenariosImpactTable };
  }

  /**
   * @description Recursive function that populates and returns
   * aggregated data of parent entity and all its children
   */
  private populateValuesRecursively(
    entity: ScenariosImpactTableRows,
    calculatedRows: ScenariosImpactTableRows[],
    rangeOfYears: number[],
  ): ScenariosImpactTableRowsValues[] {
    entity.values = [];
    for (const year of rangeOfYears) {
      entity.values.push({
        year: year,
        scenariosImpacts: [],
        isProjected: false,
      });
    }

    const valuesToAggregate: ScenariosImpactTableRowsValues[][] = [];
    const selfData: ScenariosImpactTableRows | undefined = calculatedRows.find(
      (item: ScenariosImpactTableRows) => item.name === entity.name,
    );
    if (selfData) valuesToAggregate.push(selfData.values);
    entity.children.forEach((childEntity: ScenariosImpactTableRows) => {
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
    for (const [
      valueIndex,
      SceanriosImpactTableRowsValues,
    ] of entity.values.entries()) {
      valuesToAggregate.forEach((item: ScenariosImpactTableRowsValues[]) => {
        entity.values[valueIndex].scenariosImpacts =
          SceanriosImpactTableRowsValues.scenariosImpacts.map((impactRow) => {
            const sameScenarioImpact = item[valueIndex].scenariosImpacts.find(
              (impact) => impact.scenarioId === impactRow.scenarioId,
            );
            impactRow.impact =
              impactRow.impact + (sameScenarioImpact?.impact ?? 0);
            return impactRow;
          });

        entity.values[valueIndex].isProjected =
          item[valueIndex].isProjected || entity.values[valueIndex].isProjected;
      });
    }
    return entity.values;
  }

  private buildImpactTableRowsSkeleton(
    entities: ImpactTableEntityType[],
  ): ScenariosImpactTableRows[] {
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

  /**
   * @description Function that processes impact data for a Scenario, retrieved from DB,
   * finds 2 objects with same groupBy name (material, supplier, etc) and year, sbut with different
   * intervention type (replacing or canceled) and reduces it to 1 object with impact value 'before Intervention',
   * impact value of the Intervention and absolute / percentage differences between them
   */

  private static processDataForScenarioImpactTable(
    dataForImpactTable: ImpactTableData[],
  ): ImpactTableData[] {
    const dataForScenarioImpactTable: { [index: string]: ImpactTableData } =
      dataForImpactTable.reduce(
        (
          result: { [index: string]: ImpactTableData },
          item: ImpactTableData,
        ) => {
          const { impact, typeByIntervention, ...commonProperties } = item;
          const key: string = Object.values(commonProperties).join('-');
          const prevItem: ImpactTableData = result[key] || {};
          const {
            impact: prevImpact = 0,
            interventionImpact: prevInterventionImpact = 0,
          } = prevItem;

          result[key] = {
            ...item,
            impact:
              typeByIntervention ===
              SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED
                ? impact
                : prevImpact,
            interventionImpact:
              typeByIntervention ===
              SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING
                ? impact
                : prevInterventionImpact,
          };
          return result;
        },
        {},
      );

    return Object.values(dataForScenarioImpactTable);
  }
}

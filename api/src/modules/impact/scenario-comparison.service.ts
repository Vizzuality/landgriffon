import { Injectable, Logger } from '@nestjs/common';
import { GetImpactTableDto } from 'modules/impact/dto/get-impact-table.dto';
import { IndicatorsService } from 'modules/indicators/indicators.service';
import { SourcingRecordsService } from 'modules/sourcing-records/sourcing-records.service';
import {
  ImpactTableData,
  ScenarioComparisonImpact,
  ScenarioComparisonTonnes,
  ScenariosImpactTableData as ScenariosComparisonImpactTableData,
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
import {
  LOCATION_TYPES,
  SOURCING_LOCATION_TYPE_BY_INTERVENTION,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { PaginationMeta } from 'utils/app-base.service';
import { GetScenarioComparisonDto } from 'modules/impact/dto/get-scenario-comparison.dto';
import {
  PaginatedScenariosImpactTable,
  ScenarioImpact,
  ScenariosImpactTable as ScenariosComparisonTable,
  ScenariosImpactTableDataByIndicator as ScenariosComparisonImpactTableDataByIndicator,
  ScenariosImpactTablePurchasedTonnes,
  ScenariosImpactTableRows as ScenariosComparisonImpactTableRows,
  ScenariosImpactTableRowsValues,
  ScenarioTonnage,
} from 'modules/impact/dto/response-comparison-table.dto';

@Injectable()
export class ScenarioComparisonService {
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
    // Retrieving all the indicators, selected by the user
    const indicators: Indicator[] =
      await this.indicatorService.getIndicatorsById(
        scenarioComparisonDto.indicatorIds,
      );
    this.logger.log(
      'Retrieving data from DB to build Scenario Comparison Table...',
    );

    /** Getting Descendants Ids for the filters, in case Parent Ids were received,
     * adding them to the new dto without mutating the original one
     */

    const scenarioComparisonDtoWithDescendants: GetScenarioComparisonDto =
      await this.loadDescendantEntityIds(scenarioComparisonDto);

    /** Getting all the entities according to user filters and chosen 'groupBy'
     * ex. if groupBy = material, entities will be all the materials within user filters
     */
    const entities: ImpactTableEntityType[] = await this.getEntityTree(
      scenarioComparisonDtoWithDescendants,
    );

    /**
     * Paginating the entites found in the previpus steps, according to fetch specification
     */
    const paginatedEntities: PaginatedEntitiesDto =
      ScenarioComparisonService.paginateRootEntities(
        entities,
        fetchSpecification,
      );

    /** Updating entities for them to have 'parent - child' tree structure */
    this.updateGroupByCriteriaFromEntityTree(
      scenarioComparisonDtoWithDescendants,
      paginatedEntities.entities,
    );

    /** Getting Impact data (Indocator records) for the scenarios requested by user
     * and according to the selected filters. This data will be used later to fill
     * the entities structure, in 'buildScenarioComparisonTable
     */
    const scenarioComparisonImpactData: ScenariosComparisonImpactTableData[] =
      await this.getScenarioComparisonImpactData(
        scenarioComparisonDtoWithDescendants,
        paginatedEntities.entities,
      );

    /** Final step - building scenario comparison table by recursivle filling the entities inside each idicator (table rows)
     * with the impact data fpund in the previous step
     */
    const comparisonTable: ScenariosComparisonTable =
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
  ): Promise<ScenariosComparisonImpactTableData[]> {
    /** Fist we retieve all the impacts (Indicator Recors) according to dto filter
     * Result will be flat array of objects for each impact (IR) of the scenarios
     */
    const impactDataForBothSceanrios: ImpactTableData[] =
      await this.getImapctDataForScenario(scenarioComparisonDto, entities);

    /** Before returning the impacts we need to process them and aggregate impacts for both sceanrios
     * within one year and material/supplier/etc, so that scnerioImapcts are represented in format of
     * ScenariosComparisonImpactTableData
     */
    return this.groupScenarioComparisonData(impactDataForBothSceanrios);
  }

  private groupScenarioComparisonData(
    impactData: ImpactTableData[],
  ): ScenariosComparisonImpactTableData[] {
    const dataForScenarioImpactTable: ScenariosComparisonImpactTableData[] = [];

    /**Processing the impact data so that each entity (material, supplier, etc) for each requested year
     * has canceled and replaced impacts  + cancelled and replaced tonnes grouped by scenarioId -
     * in the properties scenarioImpacts and scenarioTonnes
     */
    impactData.forEach((impactData: ImpactTableData) => {
      const existingScenarioData:
        | ScenariosComparisonImpactTableData
        | undefined = dataForScenarioImpactTable.find((el: ImpactTableData) => {
        return el.name === impactData.name && el.year === impactData.year;
      });

      if (existingScenarioData) {
        dataForScenarioImpactTable[
          dataForScenarioImpactTable.indexOf(existingScenarioData)
        ].scenariosImpacts.push({
          scenarioId: impactData.scenarioId as string,
          ...(impactData.typeByIntervention ===
            SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING && {
            newImpact: impactData.impact,
          }),
          ...(impactData.typeByIntervention ===
            SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED && {
            canceledImpact: impactData.impact,
          }),
        });

        dataForScenarioImpactTable[
          dataForScenarioImpactTable.indexOf(existingScenarioData)
        ].scenariosTonnes.push({
          scenarioId: impactData.scenarioId as string,
          ...(impactData.typeByIntervention ===
            SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING && {
            newTonnage: Number(impactData.tonnes),
          }),
          ...(impactData.typeByIntervention ===
            SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED && {
            canceledTonnage: Number(impactData.tonnes),
          }),
        });
      } else {
        const newComparisonData: ScenariosComparisonImpactTableData = {
          ...impactData,
          scenariosImpacts: [
            {
              scenarioId: impactData.scenarioId as string,
              ...(impactData.typeByIntervention ===
                SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING && {
                newImpact: impactData.impact,
              }),
              ...(impactData.typeByIntervention ===
                SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED && {
                canceledImpact: impactData.impact,
              }),
            },
          ],
          scenariosTonnes: [
            {
              scenarioId: impactData.scenarioId as string,
              ...(impactData.typeByIntervention ===
                SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING && {
                newTonnage: Number(impactData.tonnes),
              }),
              ...(impactData.typeByIntervention ===
                SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED && {
                canceledTonnage: Number(impactData.tonnes),
              }),
            },
          ],
        };
        dataForScenarioImpactTable.push(newComparisonData);
      }
    });

    /** Reducing scenarioImapcts by grouping them by scenarioId and calculating impactResult as the difference
     * between newImpact and canceledImpacts
     */

    dataForScenarioImpactTable.forEach(
      (scenarioImpactElement: ScenariosComparisonImpactTableData) => {
        // First we proccess and reduce scenario impacts
        const groupedScenarioImpacts: ScenarioComparisonImpact[] =
          Object.values(
            scenarioImpactElement.scenariosImpacts.reduce(
              (
                result: { [index: string]: ScenarioComparisonImpact },
                item: ScenarioComparisonImpact,
              ) => {
                const { newImpact, canceledImpact, scenarioId } = item;
                const key: string = scenarioId;
                const prevItem: ScenarioComparisonImpact = result[key] || {};
                const {
                  newImpact: prevNewImpact = 0,
                  canceledImpact: prevCanceledImpact = 0,
                } = prevItem;

                result[key] = {
                  scenarioId,
                  newImpact: (prevItem ? prevNewImpact : 0) + (newImpact || 0),
                  canceledImpact:
                    (prevItem ? prevCanceledImpact : 0) + (canceledImpact || 0),
                };
                result[key].impactResult =
                  (result[key].newImpact || 0) -
                  (result[key].canceledImpact || 0);
                return result;
              },
              {},
            ),
          );

        scenarioImpactElement.scenariosImpacts = groupedScenarioImpacts;

        // Then we do the same for tonnages
        const groupedScenarioTonnes: ScenarioComparisonTonnes[] = Object.values(
          scenarioImpactElement.scenariosTonnes.reduce(
            (
              result: { [index: string]: ScenarioComparisonTonnes },
              item: ScenarioComparisonTonnes,
            ) => {
              const { newTonnage, canceledTonnage, scenarioId } = item;
              const key: string = scenarioId;
              const prevItem: ScenarioComparisonTonnes = result[key] || {};
              const {
                newTonnage: prevNewTonnage = 0,
                canceledTonnage: prevCanceledTonnage = 0,
              } = prevItem;

              result[key] = {
                scenarioId,
                newTonnage: (prevItem ? prevNewTonnage : 0) + (newTonnage || 0),
                canceledTonnage:
                  (prevItem ? prevCanceledTonnage : 0) + (canceledTonnage || 0),
              };
              result[key].tonnageDifference =
                (result[key].newTonnage || 0) -
                (result[key].canceledTonnage || 0);
              return result;
            },
            {},
          ),
        );
        scenarioImpactElement.scenariosTonnes = groupedScenarioTonnes;
      },
    );

    return dataForScenarioImpactTable;
  }

  private async loadDescendantEntityIds(
    scenarioCompariosonTableDto: GetScenarioComparisonDto,
  ): Promise<GetScenarioComparisonDto> {
    const scenarioCompariosonTableDtoWithDescentants: GetScenarioComparisonDto =
      {
        ...scenarioCompariosonTableDto,
      };
    if (scenarioCompariosonTableDtoWithDescentants.originIds)
      scenarioCompariosonTableDtoWithDescentants.originIds =
        await this.adminRegionsService.getAdminRegionDescendants(
          scenarioCompariosonTableDtoWithDescentants.originIds,
        );
    if (scenarioCompariosonTableDtoWithDescentants.materialIds)
      scenarioCompariosonTableDtoWithDescentants.materialIds =
        await this.materialsService.getMaterialsDescendants(
          scenarioCompariosonTableDtoWithDescentants.materialIds,
        );
    if (scenarioCompariosonTableDtoWithDescentants.supplierIds)
      scenarioCompariosonTableDtoWithDescentants.supplierIds =
        await this.suppliersService.getSuppliersDescendants(
          scenarioCompariosonTableDtoWithDescentants.supplierIds,
        );

    return scenarioCompariosonTableDtoWithDescentants;
  }

  /**
   * Returns an array of ImpactTable Entities, determined by the grouBy field and properties
   * of the GetImpactTableDto
   * @param scenarioComparisonTableDto
   * @private
   */
  private async getEntityTree(
    scenarioComparisonTableDto: GetScenarioComparisonDto,
  ): Promise<ImpactTableEntityType[]> {
    const treeOptions: GetMaterialTreeWithOptionsDto = {
      ...(scenarioComparisonTableDto.materialIds && {
        materialIds: scenarioComparisonTableDto.materialIds,
      }),
      ...(scenarioComparisonTableDto.originIds && {
        originIds: scenarioComparisonTableDto.originIds,
      }),
      ...(scenarioComparisonTableDto.supplierIds && {
        supplierIds: scenarioComparisonTableDto.supplierIds,
      }),
      ...(scenarioComparisonTableDto.scenarioIds && {
        scenarioIds: scenarioComparisonTableDto.scenarioIds,
      }),
    };
    switch (scenarioComparisonTableDto.groupBy) {
      case GROUP_BY_VALUES.MATERIAL: {
        return this.materialsService.getMaterialsTreeWithSourcingLocations(
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
    sceanrioComparisonTableDto: GetScenarioComparisonDto,
    entities: ImpactTableEntityType[],
  ): void {
    switch (sceanrioComparisonTableDto.groupBy) {
      case GROUP_BY_VALUES.MATERIAL:
        sceanrioComparisonTableDto.materialIds = this.getIdsFromTree(
          entities,
          sceanrioComparisonTableDto.materialIds,
        );
        break;
      case GROUP_BY_VALUES.REGION:
        sceanrioComparisonTableDto.originIds = this.getIdsFromTree(
          entities,
          sceanrioComparisonTableDto.originIds,
        );
        break;
      case GROUP_BY_VALUES.SUPPLIER:
        sceanrioComparisonTableDto.supplierIds = this.getIdsFromTree(
          entities,
          sceanrioComparisonTableDto.materialIds,
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
    dataForComparisonTable: ScenariosComparisonImpactTableData[],
    entities: ScenariosComparisonImpactTableRows[],
  ): ScenariosComparisonTable {
    this.logger.log('Building Scenario Comparison Table...');
    const { groupBy, startYear, endYear } = queryDto;
    const scenariosComparisonImpactTable: ScenariosComparisonImpactTableDataByIndicator[] =
      [];
    // Create a range of years by start and endYears
    const rangeOfYears: number[] = range(startYear, endYear + 1);
    // Append data by indicator and add its unit.symbol as metadata. We need awareness of this loop during the whole process
    indicators.forEach((indicator: Indicator, indicatorValuesIndex: number) => {
      const calculatedData: ScenariosComparisonImpactTableRows[] = [];
      scenariosComparisonImpactTable.push({
        indicatorShortName: indicator.shortName as string,
        indicatorId: indicator.id,
        groupBy: groupBy,
        rows: [],
        yearSum: [],
        metadata: { unit: indicator.unit.symbol },
      });
      // Filter the raw data by Indicator
      const scenariosComparisonDataByIndicator: ScenariosComparisonImpactTableData[] =
        dataForComparisonTable.filter(
          (data: ScenariosComparisonImpactTableData) =>
            data.indicatorId === indicator.id,
        );
      // Get unique entity names for aggregations from raw data
      const namesByIndicator: string[] = [
        ...new Set(
          scenariosComparisonDataByIndicator.map(
            (el: ScenariosComparisonImpactTableData) => el.name,
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
          const dataForYear: ScenariosComparisonImpactTableData | undefined =
            scenariosComparisonDataByIndicator.find(
              (data: ScenariosComparisonImpactTableData) =>
                data.year === year && data.name === name,
            );
          //If the year requested by the users exist in the raw data, append its scenarios impacts values. There will always be a first valid value to start with
          if (dataForYear) {
            calculatedData[namesByIndicatorIndex].values.push({
              year: dataForYear.year,
              scenariosImpacts: dataForYear.scenariosImpacts,
              isProjected: false,
            });
            // If the year requested does no exist in the raw data, project its value getting the latest value (previous year which comes in ascendant order)
          } else {
            const lastYearsValue: ScenarioComparisonImpact[] =
              rowValuesIndex > 0
                ? calculatedData[namesByIndicatorIndex].values[
                    rowValuesIndex - 1
                  ].scenariosImpacts
                : [{ scenarioId: 'none' }];

            // After we found previous year, we need to multiply each scenario impact by growth rate
            const projectedScenariosImpacts: ScenarioComparisonImpact[] =
              lastYearsValue.map((scenarioImpact: ScenarioImpact) => {
                const newScenarioImpact: ScenarioImpact = JSON.parse(
                  JSON.stringify(scenarioImpact),
                );
                newScenarioImpact.newImpact =
                  (newScenarioImpact.newImpact || 0) +
                  ((newScenarioImpact.newImpact || 0) * this.growthRate) / 100;
                newScenarioImpact.canceledImpact =
                  (newScenarioImpact.canceledImpact || 0) +
                  ((newScenarioImpact.canceledImpact || 0) * this.growthRate) /
                    100;

                newScenarioImpact.impactResult =
                  newScenarioImpact.newImpact -
                  newScenarioImpact.canceledImpact;

                return newScenarioImpact;
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

      //Once we have all data, projected or not, append the total sum of scenario impacts by year and indicator
      rangeOfYears.forEach((year: number) => {
        // First we are creating array of all the scenario values objects we have (values contain year, scenarioImpacts and isProjected boolean)
        const allScenariosValues: ScenariosImpactTableRowsValues[] = [];
        calculatedData.forEach((row: ScenariosComparisonImpactTableRows) => {
          allScenariosValues.push(...row.values);
        });

        // Then we filter it to have only scenario values for the current year of iteration
        const allValuesForTheYear: ScenariosImpactTableRowsValues[] =
          allScenariosValues.filter(
            (scenarioValues: ScenariosImpactTableRowsValues) => {
              return scenarioValues.year === year;
            },
          );

        // Now we are going to process the array of scenario values and extract just their scenarioImpacts
        const allScenariosImpacts: ScenarioImpact[] = [];
        allValuesForTheYear.forEach(
          (scenarioValue: ScenariosImpactTableRowsValues) => {
            allScenariosImpacts.push(...scenarioValue.scenariosImpacts);
          },
        );

        // After we have all the scenarioImpacts in one array, we will reduce the array to aggregate and groupBy scenarioId

        const totalSumByYear: ScenarioImpact[] = Object.values(
          allScenariosImpacts.reduce(
            (
              acc: { [index: string]: ScenarioImpact },
              scenarioImpact: ScenarioImpact,
            ) => {
              const { scenarioId, newImpact, canceledImpact } = scenarioImpact;
              acc[scenarioId] = {
                scenarioId,
                newImpact:
                  (acc[scenarioId] ? acc[scenarioId].newImpact || 0 : 0) +
                  (newImpact || 0),
                canceledImpact:
                  (acc[scenarioId] ? acc[scenarioId].canceledImpact || 0 : 0) +
                  (canceledImpact || 0),
              };
              acc[scenarioId].impactResult =
                (acc[scenarioId].newImpact || 0) -
                (acc[scenarioId].canceledImpact || 0);

              return acc;
            },
            {},
          ),
        );

        scenariosComparisonImpactTable[indicatorValuesIndex].yearSum.push({
          year,
          values: totalSumByYear,
        });
      });

      // copy and populate tree skeleton for each indicator
      const skeleton: ScenariosComparisonImpactTableRows[] = JSON.parse(
        JSON.stringify(entities),
      );
      skeleton.forEach((entity: any) => {
        this.populateValuesRecursively(entity, calculatedData, rangeOfYears);
      });

      scenariosComparisonImpactTable[indicatorValuesIndex].rows = skeleton;
    });

    const purchasedTonnes: ScenariosImpactTablePurchasedTonnes[] =
      this.getTotalPurchasedVolumeByYear(rangeOfYears, dataForComparisonTable);

    return {
      scenariosImpactTable: scenariosComparisonImpactTable,
      purchasedTonnes,
    };
  }

  /**
   * @description Recursive function calculates total purchased tonnes per year per scenario
   */

  private getTotalPurchasedVolumeByYear(
    rangeOfYears: number[],
    scenarioComparisonImpactData: ScenariosComparisonImpactTableData[],
  ): ScenariosImpactTablePurchasedTonnes[] {
    const purchasedTonnes: ScenariosImpactTablePurchasedTonnes[] = [];
    rangeOfYears.forEach((year: number, yearIndex: number) => {
      const dataAvailableForTheYear: ScenariosComparisonImpactTableData[] =
        scenarioComparisonImpactData.filter(
          (el: ScenariosComparisonImpactTableData) => el.year === year,
        );

      if (dataAvailableForTheYear.length > 0) {
        const impactDataWithCombinedTonnes: ScenariosComparisonImpactTableData =
          dataAvailableForTheYear.reduce(
            (
              acc: ScenariosComparisonImpactTableData,
              currentValue: ScenariosComparisonImpactTableData,
            ) => {
              acc.scenariosTonnes = acc.scenariosTonnes.concat(
                currentValue.scenariosTonnes,
              );
              return acc;
            },
          );

        const scenariosTonnages: ScenarioTonnage[] = Object.values(
          impactDataWithCombinedTonnes.scenariosTonnes.reduce(
            (
              acc: { [index: string]: ScenarioTonnage },
              scenarioTonnage: ScenarioTonnage,
            ) => {
              const { scenarioId, newTonnage, canceledTonnage } =
                scenarioTonnage;
              acc[scenarioId] = {
                scenarioId,
                newTonnage:
                  (acc[scenarioId] ? acc[scenarioId].newTonnage || 0 : 0) +
                  (newTonnage || 0),
                canceledTonnage:
                  (acc[scenarioId] ? acc[scenarioId].canceledTonnage || 0 : 0) +
                  (canceledTonnage || 0),
              };

              acc[scenarioId].tonnageDifference =
                (acc[scenarioId].newTonnage || 0) -
                (acc[scenarioId].canceledTonnage || 0);

              return acc;
            },
            {},
          ),
        );
        purchasedTonnes.push({
          year,
          values: scenariosTonnages,
          isProjected: false,
        });
      } else {
        const lastYearsTonnages: ScenarioTonnage[] =
          purchasedTonnes[yearIndex - 1].values;

        const projectedScenariosTonnages: ScenarioTonnage[] =
          lastYearsTonnages.map((scenarioTonnage: ScenarioTonnage) => {
            const newScenarioTonnage: ScenarioTonnage = JSON.parse(
              JSON.stringify(scenarioTonnage),
            );
            newScenarioTonnage.newTonnage =
              (scenarioTonnage.newTonnage || 0) +
              ((newScenarioTonnage.newTonnage || 0) * this.growthRate) / 100;
            newScenarioTonnage.canceledTonnage =
              (newScenarioTonnage.canceledTonnage || 0) +
              ((newScenarioTonnage.canceledTonnage || 0) * this.growthRate) /
                100;

            newScenarioTonnage.tonnageDifference =
              (newScenarioTonnage.newTonnage || 0) -
              (newScenarioTonnage.canceledTonnage || 0);
            return newScenarioTonnage;
          });
        purchasedTonnes.push({
          year,
          values: projectedScenariosTonnages,
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
    entity: ScenariosComparisonImpactTableRows,
    calculatedRows: ScenariosComparisonImpactTableRows[],
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
    const selfData: ScenariosComparisonImpactTableRows | undefined =
      calculatedRows.find(
        (item: ScenariosComparisonImpactTableRows) => item.name === entity.name,
      );
    if (selfData) valuesToAggregate.push(selfData.values);
    entity.children.forEach(
      (childEntity: ScenariosComparisonImpactTableRows) => {
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
      SceanriosImpactTableRowsValues,
    ] of entity.values.entries()) {
      valuesToAggregate.forEach((item: ScenariosImpactTableRowsValues[]) => {
        const totalScenarioImpacts: ScenarioImpact[] = item[
          valueIndex
        ].scenariosImpacts.concat(
          SceanriosImpactTableRowsValues.scenariosImpacts,
        );

        entity.values[valueIndex].scenariosImpacts = Object.values(
          totalScenarioImpacts.reduce(
            (
              acc: { [index: string]: ScenarioImpact },
              scenarioImpact: ScenarioImpact,
            ) => {
              const { scenarioId, newImpact, canceledImpact } = scenarioImpact;
              acc[scenarioId] = {
                scenarioId,
                newImpact:
                  (acc[scenarioId] ? acc[scenarioId].newImpact || 0 : 0) +
                  (newImpact || 0),
                canceledImpact:
                  (acc[scenarioId] ? acc[scenarioId].canceledImpact || 0 : 0) +
                  (canceledImpact || 0),
              };
              acc[scenarioId].impactResult =
                (acc[scenarioId].newImpact || 0) -
                (acc[scenarioId].canceledImpact || 0);

              return acc;
            },
            {},
          ),
        );

        entity.values[valueIndex].isProjected =
          item[valueIndex].isProjected || entity.values[valueIndex].isProjected;
      });
    }
    return entity.values;
  }

  private buildImpactTableRowsSkeleton(
    entities: ImpactTableEntityType[],
  ): ScenariosComparisonImpactTableRows[] {
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
}

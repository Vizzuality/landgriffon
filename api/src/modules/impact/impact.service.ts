import { Injectable, Logger } from '@nestjs/common';
import { GetImpactTableDto } from 'modules/impact/dto/get-impact-table.dto';
import { IndicatorsService } from 'modules/indicators/indicators.service';
import { SourcingRecordsService } from 'modules/sourcing-records/sourcing-records.service';
import { SourcingLocationsService } from 'modules/sourcing-locations/sourcing-locations.service';
import { ImpactTableData } from 'modules/sourcing-records/sourcing-record.repository';
import { Indicator } from 'modules/indicators/indicator.entity';
import { range } from 'lodash';
import {
  ImpactTable,
  ImpactTableDataByIndicator,
  ImpactTablePurchasedTonnes,
  ImpactTableRows,
} from 'modules/impact/dto/response-impact-table.dto';
import { MaterialsService } from 'modules/materials/materials.service';
import { Material } from 'modules/materials/material.entity';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { SuppliersService } from 'modules/suppliers/suppliers.service';

@Injectable()
export class ImpactService {
  //TODO: Hack to set a expected growing rate. This needs to be stored in the DB in the future
  growthRate: number = 1.5;
  logger: Logger = new Logger(ImpactService.name);

  constructor(
    private readonly indicatorService: IndicatorsService,
    private readonly sourcingRecordService: SourcingRecordsService,
    private readonly sourcingLocationService: SourcingLocationsService,
    private readonly materialsService: MaterialsService,
    private readonly adminRegionsService: AdminRegionsService,
    private readonly suppliersService: SuppliersService,
  ) {}

  async getImpactTable(
    impactTableDto: GetImpactTableDto,
  ): Promise<ImpactTable> {
    const indicators: Indicator[] =
      await this.indicatorService.getIndicatorsById(
        impactTableDto.indicatorIds,
      );
    this.logger.log('Retrieving data from DB to build Impact Table...');

    const dataForImpactTable: ImpactTableData[] =
      await this.sourcingRecordService.getDataForImpactTable(impactTableDto);
    return this.buildImpactTable(
      impactTableDto,
      indicators,
      dataForImpactTable,
    );
  }

  private buildImpactTable(
    queryDto: GetImpactTableDto,
    indicators: Indicator[],
    dataForImpactTable: ImpactTableData[],
  ): ImpactTable {
    this.logger.log('Building Impact Table...');
    const { groupBy, startYear, endYear } = queryDto;
    const impactTable: ImpactTableDataByIndicator[] = [];
    // Create a range of years by start and endYears
    const rangeOfYears: number[] = range(startYear, endYear + 1);
    // Append data by indicator and add its unit.symbol as metadata. We need awareness of this loop during the whole process
    indicators.forEach((indicator: Indicator, indicatorValuesIndex: number) => {
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
        impactTable[indicatorValuesIndex].rows.push({ name, values: [] });
        let rowValuesIndex: number = 0;
        for (const year of rangeOfYears) {
          const dataForYear: ImpactTableData | undefined = dataByIndicator.find(
            (data: ImpactTableData) => data.year === year,
          );
          //If the year requested by the users exist in the raw data, append its value. There will always be a first valid value to start with
          if (dataForYear) {
            impactTable[indicatorValuesIndex].rows[
              namesByIndicatorIndex
            ].values.push({
              year: dataForYear.year,
              value: dataForYear.impact,
              isProjected: false,
            });
            // If the year requested does no exist in the raw data, project its value getting the latest value (previous year which comes in ascendant order)
          } else {
            const lastYearsValue: number =
              impactTable[indicatorValuesIndex].rows[namesByIndicatorIndex]
                .values[rowValuesIndex - 1].value;
            impactTable[indicatorValuesIndex].rows[
              namesByIndicatorIndex
            ].values.push({
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
        const totalSumByYear: number = impactTable[
          indicatorValuesIndex
        ].rows.reduce(
          (accumulator: number, currentValue: ImpactTableRows): number => {
            if (currentValue.values[indexOfYear].year === year)
              accumulator += currentValue.values[indexOfYear].value;
            return accumulator;
          },
          0,
        );
        impactTable[indicatorValuesIndex].yearSum.push({
          year,
          value: totalSumByYear,
        });
      });
    });
    const purchasedTonnes: ImpactTablePurchasedTonnes[] =
      this.getTotalPurchasedVolumeByYear(rangeOfYears, dataForImpactTable);
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
            accumulator += +currentValue.impact;
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
        const tonnesToProject: number =
          dataForImpactTable[dataForImpactTable.length - 1].impact;
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
   *
   * @description Get a tree of Materials imported by a User
   */

  async getMaterialTreeForImpact(): Promise<Material[]> {
    const materialIdsFromSourcingLocations: string[] =
      await this.sourcingLocationService.getMaterialIdsAndParentIds();
    const allMaterials: Material[] =
      await this.materialsService.findAllUnpaginated();
    const materialLineage: Material[] = this.getAncestry<Material>(
      allMaterials,
      materialIdsFromSourcingLocations,
    );
    return this.materialsService.serialize(
      this.buildTree<Material>(materialLineage, null),
    );
  }

  /**
   *
   * @description Get a tree of AdminRegions imported by a User
   */

  async getAdminRegionTreeForImpact(): Promise<any> {
    const adminRegionIdsFromSourcingLocations: string[] =
      await this.sourcingLocationService.getAdminRegionIdsAndParentIds();
    const allAdminRegions: AdminRegion[] =
      await this.adminRegionsService.findAllUnpaginated();
    const adminRegionLineage: AdminRegion[] = this.getAncestry<AdminRegion>(
      allAdminRegions,
      adminRegionIdsFromSourcingLocations,
    );

    return this.adminRegionsService.serialize(
      this.buildTree<AdminRegion>(adminRegionLineage, null),
    );
  }

  /**
   *
   * @description Get a tree of Suppliers imported by a User
   */

  async getSupplierTreeForImpact(): Promise<any> {
    const supplierIdsFromSourcingLocations: string[] =
      await this.sourcingLocationService.getSupplierIdsAndParentIds();
    const allSuppliers: Supplier[] =
      await this.suppliersService.findAllUnpaginated();
    const supplierLineage: Supplier[] = this.getAncestry<Supplier>(
      allSuppliers,
      supplierIdsFromSourcingLocations,
    );
    return this.suppliersService.serialize(
      this.buildTree<Supplier>(supplierLineage, null),
    );
  }

  /**
   * @description Given a array of entities and a array of IDs, retrieves a array of elements
   * with ascendant ancestry until root level
   *
   * @param entityArray Array of entities of a given type
   * @param relevantItemIds Array of IDs of the relevant items within the first param
   */
  getAncestry<T extends { id: string; parentId?: string; children?: T[] }>(
    entityArray: T[],
    relevantItemIds: string[],
  ): T[] {
    // Create a new array with relevant elements (matching Ids)
    const relevantItems: T[] = entityArray.filter((entity: T) =>
      relevantItemIds.includes(entity.id),
    );

    // Iterate the array and if any element has a parentId, find it and push it to the same array to 'recursively' find the lineage until root level
    for (const element of relevantItems) {
      if (element.parentId) {
        relevantItems.push(
          entityArray.find((entity: T) => entity.id === element.parentId) as T,
        );
      }
    }

    // As some elements could have the same parent, clean the array using a Map to leave only unique elements in it
    const uniqueElements: T[] = [
      ...new Map(
        relevantItems.map((element: T) => [element.id, element]),
      ).values(),
    ];

    return uniqueElements;
  }

  /**
   *
   *
   * @param nodes Array of related elements in a flat format
   * @param parentId Id of the parent
   * @description: Recursively build a tree.
   * @private
   */

  private buildTree<T extends { id: string; parentId?: string; children: T[] }>(
    nodes: T[],
    parentId: string | null,
  ): T[] {
    return nodes
      .filter((node: T) => node.parentId === parentId)
      .reduce(
        (tree: T[], node: T) => [
          ...tree,
          {
            ...node,
            children: this.buildTree(nodes, node.id),
          },
        ],
        [],
      );
  }
}

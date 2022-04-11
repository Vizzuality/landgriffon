import { Injectable, Logger } from '@nestjs/common';
import { GetImpactTableDto } from 'modules/impact/dto/get-impact-table.dto';
import { IndicatorsService } from 'modules/indicators/indicators.service';
import { SourcingRecordsService } from 'modules/sourcing-records/sourcing-records.service';
import { ImpactTableData } from 'modules/sourcing-records/sourcing-record.repository';
import { Indicator } from 'modules/indicators/indicator.entity';
import { range } from 'lodash';
import {
  ImpactTable,
  ImpactTableDataByIndicator,
  ImpactTablePurchasedTonnes,
  ImpactTableRows,
  ImpactTableRowsValues,
} from 'modules/impact/dto/response-impact-table.dto';
import { BusinessUnitsService } from 'modules/business-units/business-units.service';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';
import { SuppliersService } from 'modules/suppliers/suppliers.service';
import { MaterialsService } from 'modules/materials/materials.service';
import { GROUP_BY_VALUES } from 'modules/h3-data/dto/get-impact-map.dto';
import { ImpactTableEntityType } from 'types/impact-table-entity.type';

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
  ): Promise<ImpactTable> {
    const indicators: Indicator[] =
      await this.indicatorService.getIndicatorsById(
        impactTableDto.indicatorIds,
      );
    this.logger.log('Retrieving data from DB to build Impact Table...');
    let entities: ImpactTableEntityType[] = [];

    /*
     * Get full entity tree in cate ids are not passed,
     * otherwise get trees based on given ids and add children and parent
     * ids to them to get full data for aggregations
     */
    switch (impactTableDto.groupBy) {
      case GROUP_BY_VALUES.MATERIAL:
        if (impactTableDto.materialIds) {
          entities =
            await this.materialsService.getMaterialsTreeWithSourcingLocations({
              materialIds: impactTableDto.materialIds,
            });
          impactTableDto.materialIds = this.getIdsFromTree(entities);
        } else {
          entities =
            await this.materialsService.getMaterialsTreeWithSourcingLocations(
              {},
            );
        }
        break;
      case GROUP_BY_VALUES.REGION:
        if (impactTableDto.originIds) {
          entities =
            await this.adminRegionsService.getAdminRegionTreeWithSourcingLocations(
              { originIds: impactTableDto.originIds },
            );
          impactTableDto.originIds = this.getIdsFromTree(entities);
        } else {
          entities =
            await this.adminRegionsService.getAdminRegionTreeWithSourcingLocations(
              {},
            );
        }
        break;
      case GROUP_BY_VALUES.SUPPLIER:
        if (impactTableDto.supplierIds) {
          entities =
            await this.suppliersService.getSuppliersWithSourcingLocations({
              supplierIds: impactTableDto.supplierIds,
            });
          impactTableDto.supplierIds = this.getIdsFromTree(entities);
        } else {
          entities =
            await this.suppliersService.getSuppliersWithSourcingLocations({});
        }
        break;
      case GROUP_BY_VALUES.BUSINESS_UNIT:
        entities =
          await this.businessUnitsService.getBusinessUnitTreeWithSourcingLocations(
            {},
          );
        break;
      default:
    }

    const dataForImpactTable: ImpactTableData[] =
      await this.sourcingRecordService.getDataForImpactTable(impactTableDto);
    return this.buildImpactTable(
      impactTableDto,
      indicators,
      dataForImpactTable,
      this.buildImpactTableRowsSkeleton(entities),
    );
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
              value: dataForYear.impact,
              isProjected: false,
            });
            // If the year requested does no exist in the raw data, project its value getting the latest value (previous year which comes in ascendant order)
          } else {
            const lastYearsValue: number =
              calculatedData[namesByIndicatorIndex].values[rowValuesIndex - 1]
                .value;
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
      impactTable[indicatorValuesIndex].rows = skeleton.filter(
        (item: ImpactTableRows) =>
          item.children.length > 0 || item.values[0].value > 0,
      );
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
            accumulator += Number.isFinite(+currentValue.impact)
              ? +currentValue.impact
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
   * @description Retrieve base estimates for all indicators
   */
  async getEstimates(): Promise<any> {}

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

  private getIdsFromTree(entities: ImpactTableEntityType[]): string[] {
    return entities.reduce((ids: string[], entity: ImpactTableEntityType) => {
      const childIds: string[] =
        entity.children.length > 0 ? this.getIdsFromTree(entity.children) : [];
      return [...ids, ...childIds, entity.id];
    }, []);
  }
}

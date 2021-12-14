import { Injectable, Logger } from '@nestjs/common';
import { GetImpactTableDto } from 'modules/impact/dto/get-impact-table.dto';
import { IndicatorsService } from 'modules/indicators/indicators.service';
import { SourcingRecordsService } from 'modules/sourcing-records/sourcing-records.service';
import { SourcingLocationsService } from 'modules/sourcing-locations/sourcing-locations.service';
import { ImpactTableData } from 'modules/sourcing-records/sourcing-record.repository';
import { Indicator } from 'modules/indicators/indicator.entity';
import { range } from 'lodash';

export class ImpactTable {
  impactTable: ImpactTableDataByIndicator[];
  purchasedTonnes: ImpactTablePurchasedTonnes[];
}

export class ImpactTableDataByIndicator {
  indicatorShortName: string;
  indicatorId: string;
  groupBy: string;
  rows: ImpactTableRows[];
  yearSum: YearSumData[];
  metadata: { unit: string };
  values?: ImpactTableRowsValues[];
}

export class ImpactTablePurchasedTonnes {
  year: number;
  value: number;
  isProjected: boolean;
}
export class ImpactTableRows {
  name: string;
  values: ImpactTableRowsValues[];
}

export class YearSumData {
  year: number;
  value: number;
}

export class ImpactTableRowsValues {
  year: number;
  value: number;
  isProjected: boolean;
}

@Injectable()
export class ImpactService {
  //TODO: Hack to set a expected growing rate. This needs to be stored in the DB in the future
  growthRate: number = 1.5;
  logger: Logger = new Logger(ImpactService.name);

  constructor(
    public readonly indicatorService: IndicatorsService,
    public readonly sourcingRecordService: SourcingRecordsService,
    public readonly sourcingLocationService: SourcingLocationsService,
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
    const rangeOfYears: number[] = range(startYear, endYear + 1);
    indicators.forEach((indicator: Indicator, i: number) => {
      impactTable.push({
        indicatorShortName: indicator.shortName as string,
        indicatorId: indicator.id,
        groupBy: groupBy,
        rows: [],
        yearSum: [],
        metadata: { unit: indicator.unit.symbol },
      });
      const dataByIndicator: ImpactTableData[] = dataForImpactTable.filter(
        (data: ImpactTableData) => data.indicatorId === indicator.id,
      );
      const namesByIndicator: string[] = [
        ...new Set(dataByIndicator.map((el: ImpactTableData) => el.name)),
      ];

      for (const [index, name] of namesByIndicator.entries()) {
        impactTable[i].rows.push({ name, values: [] });
        let rowIndex: number = 0;
        for (const year of rangeOfYears) {
          const dataForYear: ImpactTableData | undefined = dataByIndicator.find(
            (data: ImpactTableData) => {
              return (data.year as unknown as number) === year;
            },
          );
          if (dataForYear) {
            impactTable[i].rows[index].values.push({
              year: parseInt(dataForYear.year),
              value: dataForYear.impact,
              isProjected: false,
            });
            ++rowIndex;
          } else {
            const lastYearsValue: number =
              impactTable[i].rows[index].values[rowIndex - 1].value;
            impactTable[i].rows[index].values.push({
              year: year,
              value: lastYearsValue + (lastYearsValue * this.growthRate) / 100,
              isProjected: true,
            });
            ++rowIndex;
          }
        }
      }
      rangeOfYears.forEach((year: number, index: number) => {
        const totalSumByYear: number = impactTable[i].rows.reduce(
          (acc: number, cur: ImpactTableRows): number => {
            if (cur.values[index].year === year) acc += cur.values[index].value;
            return acc;
          },
          0,
        );
        impactTable[i].yearSum.push({ year, value: totalSumByYear });
      });
    });
    const purchasedTonnes: ImpactTablePurchasedTonnes[] = [];
    rangeOfYears.forEach((year: number) => {
      const valueOfPurchasedTonnesByYear: number = dataForImpactTable.reduce(
        (acc: number, cur: ImpactTableData): number => {
          if (+cur.year === year) {
            acc += +cur.impact;
          }
          return acc;
        },
        0,
      );
      if (valueOfPurchasedTonnesByYear) {
        purchasedTonnes.push({
          year,
          value: valueOfPurchasedTonnesByYear,
          isProjected: false,
        });
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
    this.logger.log('Impact Table built');
    return { impactTable, purchasedTonnes };
  }
}

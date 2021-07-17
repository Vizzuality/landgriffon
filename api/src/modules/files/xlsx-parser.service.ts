import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { WorkBook, WorkSheet } from 'xlsx';
import { difference } from 'lodash';
import { DataValidationService } from 'modules/data-validation/data-validation.service';
// eslint-disable-next-line no-restricted-imports
import {
  DtoProcessorService,
  DTOTransformedData,
} from 'modules/data-validation/dto-processor.service';

export interface SourcingRecordsSheets {
  materials: Record<string, any>[];
  countries: Record<string, any>[];
  businessUnits: Record<string, any>[];
  suppliers: Record<string, any>[];
  sourcingData: Record<string, any>[];
}

const REQUIRED_SHEETS: Array<string> = [
  'materials',
  'business units',
  'suppliers',
  'countries',
  'for upload',
];
const NON_META_PROPERTIES: Array<string> = [
  'material.path',
  'business_unit.path',
  't1_supplier.name',
  'producer.name',
  'location_type',
  'location_country_input',
  'location_address_input',
  'location_latitude_input',
  'location_longitude_input',
];

@Injectable()
export class XLSXParserService {
  constructor(
    protected readonly dataValidationService: DataValidationService,
    protected readonly dtoProcessor: DtoProcessorService,
  ) {}

  async transformToJson(filePath: string): Promise<DTOTransformedData> {
    try {
      const workBook: WorkBook = XLSX.readFile(filePath);
      const importData: SourcingRecordsSheets = this.parseSheets(workBook);
      const dtoMatchedData: DTOTransformedData = await this.dtoProcessor.createDTOsFromSourcingRecordsSheets(
        importData,
      );

      /**@debt
       * Casting types until clarify how to split / where handle
       * sourcing-records / sourcing-locations
       */

      await this.dataValidationService.validateDTOs({
        ...dtoMatchedData,
        sourcingData: importData.sourcingData,
      } as DTOTransformedData);
      return dtoMatchedData as DTOTransformedData;
    } catch (error) {
      throw new Error(`XLSX file could not been parsed: ${error.message}`);
    }
  }

  private parseSheets(workBook: WorkBook): SourcingRecordsSheets {
    if (difference(REQUIRED_SHEETS, workBook.SheetNames).length) {
      throw new Error(
        `Spreadsheet is missing requires sheets: ${difference(
          REQUIRED_SHEETS,
          workBook.SheetNames,
        ).join(', ')}`,
      );
    }
    const materials: Record<string, any>[] = XLSX.utils.sheet_to_json(
      workBook.Sheets['materials'],
    );
    const businessUnits: Record<string, any>[] = XLSX.utils.sheet_to_json(
      workBook.Sheets['business units'],
    );
    const suppliers: Record<string, any>[] = XLSX.utils.sheet_to_json(
      workBook.Sheets['suppliers'],
    );
    const countries: Record<string, any>[] = XLSX.utils.sheet_to_json(
      workBook.Sheets['countries'],
    );
    const sourcingData: Record<string, any>[] = this.cleanCustomData(
      XLSX.utils.sheet_to_json(workBook.Sheets['for upload']),
    );

    return {
      materials,
      sourcingData,
      countries,
      suppliers,
      businessUnits,
    };
  }

  private isMeta(field: string): boolean {
    return !NON_META_PROPERTIES.includes(field);
  }

  private getYear(field: string): number | null {
    const regexMatch: RegExpMatchArray | null = field.match(/\d{4}_/gm);

    return regexMatch ? parseInt(regexMatch[0]) : null;
  }

  private cleanCustomData(customData: WorkSheet[]): Record<string, any>[] {
    const sourcingRecordData: Record<string, unknown>[] = [];
    /**
     * Clean all hashmaps that are empty therefore useless
     */
    const nonEmptyData = customData.filter(
      (row: WorkSheet) => row['material.path'] != '',
    );
    /**
     * Separate base properties common for each sourcing-record row
     * Separate metadata properties to metadata object common for each sourcing-record row
     * Check if current key contains a year ('2018_tonnage') if so, get the year and its value
     */
    for (const eachRecordOfCustomData of nonEmptyData) {
      const years: Record<string, unknown> = {};
      const baseProps: Record<string, unknown> = {};
      const metadata: Record<string, unknown> = {};
      for (const field in eachRecordOfCustomData) {
        if (
          eachRecordOfCustomData.hasOwnProperty(field) &&
          this.getYear(field)
        ) {
          years[field] = eachRecordOfCustomData[field];
        } else if (this.isMeta(field)) {
          metadata[field] = eachRecordOfCustomData[field];
        } else {
          baseProps[field] = eachRecordOfCustomData[field];
        }
      }
      /**
       * For each year, spread the base properties and attach metadata
       * to build each sourcing-record row
       */
      for (const year in years) {
        if (years.hasOwnProperty(year)) {
          const cleanRow: any = {
            ...baseProps,
            metadata,
          };
          cleanRow['year'] = this.getYear(year);
          cleanRow['tonnage'] = years[year];
          sourcingRecordData.push(cleanRow);
        }
      }
    }
    return sourcingRecordData;
  }
}

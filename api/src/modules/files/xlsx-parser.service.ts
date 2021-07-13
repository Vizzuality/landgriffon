import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { WorkBook, WorkSheet } from 'xlsx';

@Injectable()
export class XlsxParserService {
  private readonly sheetsToLoad: Array<string> = [
    'materials',
    'business units',
    'suppliers',
    'for upload',
  ];
  private readonly nonMetaProperties: Array<string> = [
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
  isXLSXfilePopulated(content: WorkBook): boolean {
    if (content.SheetNames.length) return true;
    throw Error('XLSX File is empty');
  }

  transformToJson(filePath: string): any {
    try {
      const wb = XLSX.readFile(filePath);
      if (this.isXLSXfilePopulated(wb))
        return this.cleanData(this.parseBySheet(wb));
    } catch (err) {
      throw new Error(`XLSX file could not been parsed: ${err.message}`);
    }
  }

  private parseBySheet(wb: WorkBook): WorkSheet[] {
    const parsedSheets: WorkSheet[] = [];
    wb.SheetNames.forEach((sheet: string) => {
      parsedSheets.push({ name: sheet, data: wb.Sheets[sheet] });
    });
    return parsedSheets.map((sheet: WorkSheet) => {
      return {
        sheet: sheet.name,
        data: XLSX.utils.sheet_to_json(sheet.data, { defval: null }),
      };
    });
  }

  private cleanData(customData: Array<any>): Array<any> {
    const materials = customData.filter(
      (sheet: WorkSheet) => sheet.sheet === 'materials',
    );
    const businessUnits = customData.filter(
      (sheet: WorkSheet) => sheet.sheet === 'business units',
    );
    const suppliers = customData.filter(
      (sheet: WorkSheet) => sheet.sheet === 'suppliers',
    );

    const clientData: any[] = [];
    const clientCustomData = customData.filter(
      (sheet: WorkSheet) => sheet.sheet === 'for upload',
    )[0];
    const isMeta = (field: string): any =>
      !this.nonMetaProperties.includes(field);
    const isYear = (field: string): any => field.match(/\d{4}_/gm);

    /**
     * Separate base properties common for each sourcing-record row
     * Separate metadata properties to metadata object common for each sourcing-record row
     * Check if current key contains a year ('2018_tonnage') if so, get the year and its value
     */
    for (const o of clientCustomData.data) {
      const years: any = {};
      const baseProps: any = {};
      const metadata: any = {};
      for (const field in o) {
        if (o.hasOwnProperty(field) && isYear(field)) {
          years[field] = o[field];
        } else if (isMeta(field)) {
          metadata[field] = o[field];
        } else {
          baseProps[field] = o[field];
        }
      }
      /**
       * For each year, spread the base properties and attach metadata
       * to build each sourcing-record row
       */
      for (const year in years) {
        if (years.hasOwnProperty(year)) {
          const cleanRow = { ...baseProps, metadata };
          cleanRow['year'] = parseInt(isYear(year));
          cleanRow['tonnage'] = years[year];
          clientData.push(cleanRow);
        }
      }
    }

    return [
      ...materials,
      ...businessUnits,
      ...suppliers,
      { sheet: clientCustomData.sheet, data: clientData },
    ];
  }
}

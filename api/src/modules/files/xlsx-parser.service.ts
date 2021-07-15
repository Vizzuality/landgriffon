import { HttpException, Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { WorkBook } from 'xlsx';
import { difference } from 'lodash';
import { Material } from 'modules/materials/material.entity';
import { MaterialsService } from 'modules/materials/materials.service';
import { CreateMaterialDto } from 'modules/materials/dto/create.material.dto';

interface SourcingRecordsSheets {
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
  constructor(protected readonly materialsService: MaterialsService) {}

  async transformToJson(filePath: string): Promise<void> {
    try {
      const workBook: WorkBook = XLSX.readFile(filePath);
      const importData: SourcingRecordsSheets = this.parseSheets(workBook);

      /**
       * @TODO:
       * - start the transaction (in a future PR)
       * - wipe the selected BD tables
       * - Import sheets in order
       */
      const materials: Material[] = await this.processMaterials(
        importData.materials,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new Error(`XLSX file could not been parsed: ${error.message}`);
    }
  }

  private async processMaterials(
    importData: Record<string, any>[],
  ): Promise<Material[]> {
    const materialList: CreateMaterialDto[] = [];
    importData.forEach((importRow: Record<string, any>) => {
      materialList.push(this.createMaterialDTOFromData(importRow));
    });

    return this.materialsService.createTree(materialList);
  }

  private createMaterialDTOFromData(
    importData: Record<string, any>,
  ): CreateMaterialDto {
    return {
      name: importData.name,
      description: importData.description,
      hsCodeId: importData.hs_2017_code,
    };
  }

  private parseSheets(workBook: WorkBook): SourcingRecordsSheets {
    if (difference(REQUIRED_SHEETS, workBook.SheetNames).length) {
      throw new HttpException(
        `Spreadsheet is missing requires sheets: ${difference(
          REQUIRED_SHEETS,
          workBook.SheetNames,
        ).join(', ')}`,
        400,
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
    const sourcingData: Record<string, any>[] = XLSX.utils.sheet_to_json(
      workBook.Sheets['for upload'],
    );

    return {
      materials,
      businessUnits,
      suppliers,
      sourcingData,
      countries,
    };
  }

  private isMeta(field: string): boolean {
    return !NON_META_PROPERTIES.includes(field);
  }

  private getYear(field: string): number | null {
    const regexMatch: RegExpMatchArray | null = field.match(/\d{4}_/gm);

    return regexMatch ? parseInt(regexMatch[0]) : null;
  }

  // private cleanData(jsonSheets: JSONSheet[]): Array<any> {
  //   const materialsSheet: JSONSheet | undefined = jsonSheets.find(
  //     (sheet: JSONSheet) => sheet.name === 'materials',
  //   );
  //
  //   const businessUnitsSheet: JSONSheet | undefined = jsonSheets.find(
  //     (sheet: JSONSheet) => sheet.name === 'business units',
  //   );
  //   const suppliersSheet: JSONSheet | undefined = jsonSheets.find(
  //     (sheet: JSONSheet) => sheet.name === 'suppliers',
  //   );
  //
  //   const uploadRecordsSheet: JSONSheet | undefined = jsonSheets.find(
  //     (sheet: JSONSheet) => sheet.name === 'for upload',
  //   );
  //
  //   if (
  //     !uploadRecordsSheet ||
  //     !materialsSheet ||
  //     !businessUnitsSheet ||
  //     !suppliersSheet
  //   ) {
  //     throw new HttpException('Spreadsheet is missing core tabs.', 400);
  //   }
  //
  //   const clientData: any[] = [];
  //
  //   /**
  //    * Separate base properties common for each sourcing-record row
  //    * Separate metadata properties to metadata object common for each sourcing-record row
  //    * Check if current key contains a year ('2018_tonnage') if so, get the year and its value
  //    */
  //   for (const uploadRecord of (uploadRecordsSheet as JSONSheet).data) {
  //     const years: any = {};
  //     const baseProps: any = {};
  //     const metadata: any = {};
  //     for (const field in uploadRecord) {
  //       if (uploadRecord.hasOwnProperty(field) && this.getYear(field)) {
  //         years[field] = uploadRecord[field];
  //       } else if (this.isMeta(field)) {
  //         metadata[field] = uploadRecord[field];
  //       } else {
  //         baseProps[field] = uploadRecord[field];
  //       }
  //     }
  //     /**
  //      * For each year, spread the base properties and attach metadata
  //      * to build each sourcing-record row
  //      */
  //     for (const year in years) {
  //       if (years.hasOwnProperty(year)) {
  //         const cleanRow = { ...baseProps, metadata };
  //         cleanRow['year'] = this.getYear(year);
  //         cleanRow['tonnage'] = years[year];
  //         clientData.push(cleanRow);
  //       }
  //     }
  //   }
  //
  //   return [];
  // {
  //   materials: materialsSheet.data,
  //   businessUnits: businessUnitsSheet.data,
  //   suppliers: suppliersSheet.data,
  //   supplierRecords: clientData,
  // };
  // }
}

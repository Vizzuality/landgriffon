import { Injectable } from '@nestjs/common';
import { SourcingRecordsDtoProcessorService } from '../dto-processor.service';
import { SheetValidatorMaterial } from './validators/material.sheet-validator';
import { BusinessUnitsSheetValidator } from './validators/business-units.sheet-validator';
import { SheetValidatorSupplier } from './validators/supplier.sheet-validator';
import { SourcingDataSheetValidator } from './validators/sourcing-data.sheet-validator';
import { IndicatorsSheetValidator } from './validators/indicators.sheet-validator';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { SourcingRecordsSheets } from '../sourcing-records-sheets.interface';

export type Sheet = {
  materials: SheetValidatorMaterial[];
  businessUnits: BusinessUnitsSheetValidator[];
  suppliers: SheetValidatorSupplier[];
  sourcingData: SourcingDataSheetValidator[];
  indicators: IndicatorsSheetValidator[];
};

type SheetName =
  | 'materials'
  | 'businessUnits'
  | 'suppliers'
  | 'sourcingData'
  | 'indicators';

export const SHEET_NAMES: SheetName[] = [
  'materials',
  'businessUnits',
  'suppliers',
  'sourcingData',
  'indicators',
];

@Injectable()
export class ExcelValidatorService {
  private readonly validators = {
    materials: SheetValidatorMaterial,
    businessUnits: BusinessUnitsSheetValidator,
    suppliers: SheetValidatorSupplier,
    sourcingData: SourcingDataSheetValidator,
    indicators: IndicatorsSheetValidator,
  };

  constructor(
    private readonly dtoProcessor: SourcingRecordsDtoProcessorService,
  ) {}

  async validate(sheet: Sheet): Promise<any> {
    const validationErrors: any[] = [];
    const { sourcingData } = await this.dtoProcessor.parseSourcingDataFromSheet(
      sheet.sourcingData,
    );

    sheet.sourcingData =
      sourcingData as unknown as SourcingDataSheetValidator[];

    for (const sheetName of SHEET_NAMES) {
      const sheetData = sheet[sheetName];
      for (const [index, record] of sheetData.entries()) {
        const validator = this.getValidator(sheetName);
        const instance: any = plainToInstance(validator, record);
        if (
          instance.location_address_input ===
          'country of production should not have address'
        ) {
          console.log('stop here');
        }
        const errors: ValidationError[] = await validate(instance);
        if (errors.length) {
          errors.forEach((error: ValidationError) => {
            if (error.constraints) {
              Object.values(error.constraints).forEach((constraint) => {
                validationErrors.push({
                  line: this.setLineNumber(index, sheetName),
                  column: error.property,
                  error: constraint,
                  sheet: sheetName,
                  type: 'validation-error',
                });
              });
            }
          });
        }
      }
    }

    const data = await this.dtoProcessor.createDTOsFromSourcingRecordsSheets(
      sheet as unknown as SourcingRecordsSheets,
    );
    return { data, validationErrors };
  }

  private getValidator(sheetName: SheetName): any {
    return this.validators[sheetName];
  }

  private setLineNumber(index: number, sheetName: SheetName): number {
    return sheetName === 'sourcingData' ? index + 5 : index + 1;
  }
}

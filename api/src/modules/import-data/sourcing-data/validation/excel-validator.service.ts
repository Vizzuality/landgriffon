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
import { ValidationProgressTracker } from '../../progress-tracker/validation.progress-tracker';
import { ImportProgressTrackerFactory } from 'modules/events/import-data/import-progress.tracker.factory';

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
    private readonly importProgressTrackerFactory: ImportProgressTrackerFactory,
  ) {}

  async validate(sheet: Sheet): Promise<any> {
    const progressTracker: ValidationProgressTracker =
      this.getProgressTracker(sheet);
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
        progressTracker.trackProgress();
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

  private getProgressTracker(sheet: Sheet): ValidationProgressTracker {
    const totalSteps: number =
      SHEET_NAMES.reduce(
        (acc: number, sheetName: SheetName) => acc + sheet[sheetName].length,
        0,
      ) + 1;
    return this.importProgressTrackerFactory.createValidationProgressTracker({
      totalSteps: totalSteps,
    });
  }
}

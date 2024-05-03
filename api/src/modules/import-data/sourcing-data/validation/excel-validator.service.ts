import { Injectable } from '@nestjs/common';
import {
  SourcingDataDTOs,
  SourcingRecordsDtoProcessorService,
} from '../dto-processor.service';
import { MaterialSheetValidator } from './validators/material.sheet-validator';
import { BusinessUnitsSheetValidator } from './validators/business-units.sheet-validator';
import { SupplierSheetValidator } from './validators/supplier.sheet-validator';
import { SourcingDataSheetValidator } from './validators/sourcing-data.sheet-validator';
import { IndicatorsSheetValidator } from './validators/indicators.sheet-validator';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { ValidationProgressTracker } from '../../progress-tracker/validation.progress-tracker';
import { ImportProgressTrackerFactory } from 'modules/events/import-data/import-progress.tracker.factory';
import { ImportTaskError } from '../../../tasks/types/import-task-error.type';

export type SourcingDataSheet = {
  materials: MaterialSheetValidator[];
  businessUnits: BusinessUnitsSheetValidator[];
  suppliers: SupplierSheetValidator[];
  sourcingData: SourcingDataSheetValidator[];
  indicators: IndicatorsSheetValidator[];
};

export type SheetName =
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
    materials: MaterialSheetValidator,
    businessUnits: BusinessUnitsSheetValidator,
    suppliers: SupplierSheetValidator,
    sourcingData: SourcingDataSheetValidator,
    indicators: IndicatorsSheetValidator,
  };

  constructor(
    private readonly dtoProcessor: SourcingRecordsDtoProcessorService,
    private readonly importProgressTrackerFactory: ImportProgressTrackerFactory,
  ) {}

  async validate(sheet: SourcingDataSheet): Promise<any> {
    const progressTracker: ValidationProgressTracker =
      this.getProgressTracker(sheet);
    const validationErrors: ImportTaskError[] = [];

    /*
     * Parse sourcing location rows and sourcing records from the sourcing data sheet
     */
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
          this.handleErrors(errors, index, sheetName, validationErrors);
        }
        progressTracker.trackProgress();
      }
    }

    const data: SourcingDataDTOs =
      await this.dtoProcessor.createDTOsFromSourcingRecordsSheets(sheet);
    return { data, validationErrors };
  }

  private getValidator(sheetName: SheetName): any {
    return this.validators[sheetName];
  }

  private setLineNumber(index: number, sheetName: SheetName): number {
    return sheetName === 'sourcingData' ? index + 5 : index + 2;
  }

  private getProgressTracker(
    sheet: SourcingDataSheet,
  ): ValidationProgressTracker {
    const totalSteps: number =
      SHEET_NAMES.reduce(
        (acc: number, sheetName: SheetName) => acc + sheet[sheetName].length,
        0,
      ) + 1;
    return this.importProgressTrackerFactory.createValidationProgressTracker({
      totalSteps: totalSteps,
    });
  }

  private handleErrors(
    errors: ValidationError[],
    index: number,
    sheetName: SheetName,
    validationErrors: ImportTaskError[],
  ): void {
    errors.forEach((error: ValidationError) => {
      if (error.constraints) {
        Object.values(error.constraints).forEach((constraint: string) => {
          validationErrors.push({
            row: this.setLineNumber(index, sheetName),
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

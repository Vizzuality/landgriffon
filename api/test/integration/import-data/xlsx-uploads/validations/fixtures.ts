import { SourcingDataImportService } from 'modules/import-data/sourcing-data/sourcing-data-import.service';
import { TestManager } from '../../../../utils/test-manager';
import { ExcelValidationError } from '../../../../../src/modules/import-data/sourcing-data/validation/validators/excel-validation.error';
import { ImportTaskError } from '../../../../../src/modules/tasks/types/import-task-error.type';
import { GeoCodingError } from 'modules/geo-coding/errors/geo-coding.error';
import { createTask } from '../../../../entity-mocks';

export class ImportValidationTestManager extends TestManager {
  url: string = '/api/v1/import/sourcing-data';

  constructor(manager: TestManager) {
    super(manager.testApp, manager.jwtToken, manager.dataSource);
  }

  WhenIImportAFileWithValidationErrors = async (): Promise<any> => {
    const sourcingDataImportService = this.testApp.get(
      SourcingDataImportService,
    );

    try {
      await sourcingDataImportService.importSourcingData(
        __dirname + '/api_test_validation_errors_datasheet.xlsx',
        '',
      );
    } catch (error) {
      return error;
    }
  };

  WhenIImportAFileWithGeoCodingErrors = async (): Promise<any> => {
    const task = await createTask();
    const sourcingDataImportService = this.testApp.get(
      SourcingDataImportService,
    );

    try {
      await sourcingDataImportService.importSourcingData(
        __dirname + '/api_test_geocoding_errors_datasheet.xlsx',
        task.id,
      );
    } catch (error) {
      console.log(error);
      return error;
    }
  };
  TheErrorShouldBeAnExcelValidationError = (error: any) => {
    expect(error).toBeInstanceOf(ExcelValidationError);
  };

  ThenErrorShouldBEAnGeoCodingError = (error: any) => {
    expect(error).toBeInstanceOf(GeoCodingError);
  };

  AndItShouldContainAllTheValidationErrorsOfTheFile = (error: any) => {
    const expectedValidationErrors: ImportTaskError[] = [
      {
        row: 2,
        column: 'name',
        error: 'Material Name must not be empty',
        sheet: 'materials',
        type: 'validation-error',
      },
      {
        row: 3,
        column: 'hs_2017_code',
        error: 'Material hs_2017_code must not be empty',
        sheet: 'materials',
        type: 'validation-error',
      },
      {
        row: 3,
        column: 'hs_2017_code',
        error: 'Material hs_2017_code is too short',
        sheet: 'materials',
        type: 'validation-error',
      },
      {
        row: 3,
        column: 'hs_2017_code',
        error: 'Material hs_2017_code must be a string',
        sheet: 'materials',
        type: 'validation-error',
      },
      {
        row: 4,
        column: 'status',
        error: 'Material status must be active or inactive',
        sheet: 'materials',
        type: 'validation-error',
      },
      {
        row: 4,
        column: 'status',
        error: 'status must be a string',
        sheet: 'materials',
        type: 'validation-error',
      },
      {
        row: 2,
        column: 'path_id',
        error: 'Business Unit path_id must be a string',
        sheet: 'businessUnits',
        type: 'validation-error',
      },
      {
        row: 2,
        column: 'path_id',
        error: 'Business Unit path_id must not be empty',
        sheet: 'businessUnits',
        type: 'validation-error',
      },
      {
        row: 3,
        column: 'name',
        error: 'Business Unit Name must not be empty',
        sheet: 'businessUnits',
        type: 'validation-error',
      },
      {
        row: 3,
        column: 'name',
        error: 'Business Unit Name must be a string',
        sheet: 'businessUnits',
        type: 'validation-error',
      },
      {
        row: 3,
        column: 'path_id',
        error: 'Supplier path_id must not be empty',
        sheet: 'suppliers',
        type: 'validation-error',
      },
      {
        row: 3,
        column: 'path_id',
        error: 'Supplier path_id must be a string',
        sheet: 'suppliers',
        type: 'validation-error',
      },
      {
        row: 4,
        column: 'name',
        error: 'Supplier Name must not be empty',
        sheet: 'suppliers',
        type: 'validation-error',
      },
      {
        row: 5,
        column: 'material.hsCode',
        error: 'Material hs code cannot be empty',
        sheet: 'sourcingData',
        type: 'validation-error',
      },
      {
        row: 7,
        column: 'business_unit.path',
        error: 'Business Unit path must be a string',
        sheet: 'sourcingData',
        type: 'validation-error',
      },
      {
        row: 7,
        column: 'business_unit.path',
        error: 'Business Unit path cannot be empty',
        sheet: 'sourcingData',
        type: 'validation-error',
      },
      {
        row: 7,
        column: 'location_country_input',
        error: 'Location country must be a string',
        sheet: 'sourcingData',
        type: 'validation-error',
      },
      {
        row: 7,
        column: 'location_country_input',
        error: 'Location country input is required',
        sheet: 'sourcingData',
        type: 'validation-error',
      },
      {
        row: 8,
        column: 'location_address_input',
        error:
          'Address must be empty for locations of type country-of-production',
        sheet: 'sourcingData',
        type: 'validation-error',
      },
      {
        row: 9,
        column: 'location_latitude_input',
        error:
          'Address input or coordinates are required for locations of type point-of-production. Latitude values must be min: -90, max: 90',
        sheet: 'sourcingData',
        type: 'validation-error',
      },
      {
        row: 9,
        column: 'location_longitude_input',
        error:
          'Address input or coordinates are required for locations of type point-of-production. Longitude values must be min: -180, max: 180',
        sheet: 'sourcingData',
        type: 'validation-error',
      },
      {
        row: 10,
        column: 'location_address_input',
        error:
          'Address input OR coordinates are required for locations of type production-aggregation-point. Address must be empty if coordinates are provided',
        sheet: 'sourcingData',
        type: 'validation-error',
      },
      {
        row: 10,
        column: 'location_latitude_input',
        error:
          'Address input OR coordinates must be provided for locations of type production-aggregation-point. Latitude must be empty if address is provided',
        sheet: 'sourcingData',
        type: 'validation-error',
      },
      {
        row: 10,
        column: 'location_longitude_input',
        error:
          'Address input OR coordinates must be provided for locations of type production-aggregation-point. Latitude must be empty if address is provided',
        sheet: 'sourcingData',
        type: 'validation-error',
      },
      {
        row: 2,
        column: 'nameCode',
        error: 'Indicator name code is too short',
        sheet: 'indicators',
        type: 'validation-error',
      },
      {
        row: 2,
        column: 'nameCode',
        error: 'Indicator name code must not be empty',
        sheet: 'indicators',
        type: 'validation-error',
      },
      {
        row: 2,
        column: 'nameCode',
        error: 'Indicator name code must be a string',
        sheet: 'indicators',
        type: 'validation-error',
      },
      {
        row: 3,
        column: 'status',
        error: 'Indicator status must be active or inactive',
        sheet: 'indicators',
        type: 'validation-error',
      },
      {
        row: 3,
        column: 'status',
        error: 'Indicator description must not be empty',
        sheet: 'indicators',
        type: 'validation-error',
      },
      {
        row: 3,
        column: 'status',
        error: 'Indicator description must be a string',
        sheet: 'indicators',
        type: 'validation-error',
      },
    ];

    expect(error.validationErrors).toEqual(expectedValidationErrors);
  };
}

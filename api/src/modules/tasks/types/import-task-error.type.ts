import { SheetName } from 'modules/import-data/sourcing-data/validation/excel-validator.service';

export type ImportTaskError = {
  row: number;
  error: string;
  column: string;
  sheet: SheetName;
  type: 'validation-error' | 'geocoding-error';
};

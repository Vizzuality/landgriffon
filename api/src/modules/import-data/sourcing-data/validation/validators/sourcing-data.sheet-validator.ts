import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  Validate,
  ValidateNested,
} from 'class-validator';
import { LOCATION_TYPES } from 'modules/sourcing-locations/sourcing-location.entity';
import { LocationAddressInputValidator } from 'modules/import-data/sourcing-data/validation/validators/address-input.custom.validator';
import { LocationLatitudeInputValidator } from 'modules/import-data/sourcing-data/validation/validators/latitude-input.custom.validator';
import { LocationLongitudeInputValidator } from 'modules/import-data/sourcing-data/validation/validators/longitude-input.custom.validator';
import { Type } from 'class-transformer';

const MAX_INT32_VALUE: number = 2147483647;

export class SourcingDataSheetValidator {
  @IsNotEmpty({
    message: 'Material hs code cannot be empty',
  })
  'material.hsCode': string;

  @IsNotEmpty({
    message: 'Business Unit path cannot be empty',
  })
  @IsString({ message: 'Business Unit path must be a string' })
  'business_unit.path': string;

  @IsString({ message: 'Business Unit name must be a string' })
  @IsOptional()
  't1_supplier.name': string;

  @IsString({ message: 'Producer name must be a string' })
  @IsOptional()
  'producer.name': string;

  @IsNotEmpty({
    message: 'location type input is required',
  })
  @IsEnum(Object.values(LOCATION_TYPES), {
    message: `Available columns for new location type: ${Object.values(
      LOCATION_TYPES,
    ).join(', ')}`,
  })
  'location_type': LOCATION_TYPES;

  @IsNotEmpty({
    message: 'Location country input is required',
  })
  @IsString({ message: 'Location country must be a string' })
  'location_country_input': string;

  @Validate(LocationAddressInputValidator)
  'location_address_input': string;

  @Validate(LocationLatitudeInputValidator)
  'location_latitude_input': number;

  @Validate(LocationLongitudeInputValidator)
  'location_longitude_input': number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SourcingRecordExcelValidator)
  'sourcingRecords': SourcingRecordExcelValidator[];
}

class SourcingRecordExcelValidator {
  @IsNumber()
  @Min(0)
  @Max(MAX_INT32_VALUE)
  tonnage: number;

  @IsNumber()
  @IsNotEmpty()
  year: number;
}

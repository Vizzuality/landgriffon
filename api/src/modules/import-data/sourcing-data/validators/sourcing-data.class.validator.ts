import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  Validate,
  ValidateNested,
} from 'class-validator';
import { LOCATION_TYPES } from 'modules/sourcing-locations/sourcing-location.entity';
import { LocationAddressInputValidator } from 'modules/import-data/sourcing-data/validators/address-input.custom.validator';
import { LocationLatitudeInputValidator } from 'modules/import-data/sourcing-data/validators/latitude-input.custom.validator';
import { LocationLongitudeInputValidator } from 'modules/import-data/sourcing-data/validators/longitude-input.custom.validator';
import { Type } from 'class-transformer';

export class SourcingDataFromExcelDto {
  @IsNotEmpty({
    message: 'Material hs code cannot be empty',
  })
  @IsString()
  @MinLength(2)
  'material.hsCode': string;

  @IsNotEmpty({
    message: 'Business Unit path cannot be empty',
  })
  @IsString()
  'business_unit.path': string;

  @IsString()
  @IsOptional()
  't1_supplier.name': string;

  @IsString()
  @IsOptional()
  'producer.name': string;

  @IsNotEmpty({
    message:
      'New location type input is required for the selected intervention type',
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
  @IsString()
  'location_country_input': string;

  @Validate(LocationAddressInputValidator)
  'location_address_input': string;

  @Validate(LocationLatitudeInputValidator)
  'location_latitude_input': number;

  @Validate(LocationLongitudeInputValidator)
  'location_longitude_input': number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SourcingRecordObject)
  'sourcingRecords': SourcingRecordObject[];
}

class SourcingRecordObject {
  @IsNumber()
  @Min(0)
  tonnage: number;

  @IsNumber()
  @IsNotEmpty()
  year: number;
}

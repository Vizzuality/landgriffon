import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateGeoRegionDto } from 'modules/geo-regions/dto/create.geo-region.dto';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateGeoRegionDto extends PartialType(CreateGeoRegionDto) {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(40)
  @ApiProperty()
  name?: string;
}

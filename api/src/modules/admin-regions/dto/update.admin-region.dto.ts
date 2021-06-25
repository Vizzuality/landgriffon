import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateAdminRegionDto } from 'modules/admin-regions/dto/create.admin-region.dto';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateAdminRegionDto extends PartialType(CreateAdminRegionDto) {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(40)
  @ApiProperty()
  name?: string;
}

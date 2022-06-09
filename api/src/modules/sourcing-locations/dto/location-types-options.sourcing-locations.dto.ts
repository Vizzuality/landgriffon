import { IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class LocationTypesOptionsDto {
  @IsUUID('4', { each: true })
  @ApiPropertyOptional()
  @IsOptional()
  supplierIds?: string[];

  @IsUUID('4', { each: true })
  @ApiPropertyOptional()
  @IsOptional()
  businessUnitIds?: string[];

  @IsUUID('4', { each: true })
  @ApiPropertyOptional()
  @IsOptional()
  originIds?: string[];

  @IsUUID('4', { each: true })
  @ApiPropertyOptional()
  @IsOptional()
  materialIds?: string[];
}

import { IsArray, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetLocationTypesDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @ApiPropertyOptional()
  @IsOptional()
  supplierIds?: string[];

  @IsArray()
  @IsUUID('4', { each: true })
  @ApiPropertyOptional()
  @IsOptional()
  businessUnitIds?: string[];

  @IsArray()
  @IsUUID('4', { each: true })
  @ApiPropertyOptional()
  @IsOptional()
  originIds?: string[];

  @IsArray()
  @IsUUID('4', { each: true })
  @ApiPropertyOptional()
  @IsOptional()
  materialIds?: string[];

  @IsUUID('4')
  @ApiPropertyOptional()
  @IsOptional()
  scenarioId?: string;
}

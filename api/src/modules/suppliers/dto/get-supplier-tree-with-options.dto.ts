/**
 * Get Supplier with options:
 */
import { IsBoolean, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetSupplierTreeWithOptions {
  @ApiPropertyOptional()
  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  withSourcingLocations?: boolean;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  depth?: number;

  // Below fields for smart filtering
  @IsUUID('4', { each: true })
  @ApiPropertyOptional()
  @IsOptional()
  materialIds?: string[];

  @IsUUID('4', { each: true })
  @ApiPropertyOptional()
  @IsOptional()
  businessUnitIds?: string[];

  @IsUUID('4', { each: true })
  @ApiPropertyOptional()
  @IsOptional()
  originIds?: string[];
}

/**
 * Get Supplier with options:
 */
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetSupplierTreeWithOptions {
  @ApiPropertyOptional()
  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  withSourcingLocations?: boolean;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  depth?: number;
}

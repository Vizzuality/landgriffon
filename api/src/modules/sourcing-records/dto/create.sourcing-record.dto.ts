import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateSourcingRecordDto {
  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  tonnage?: string;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  year?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  sourcingLocationsId?: string;
}

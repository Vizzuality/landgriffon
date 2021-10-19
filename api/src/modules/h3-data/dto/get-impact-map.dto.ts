import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsGreaterOrEqualThan,
  IsSmallerOrEqualThan,
} from 'decorators/comparison.decorator';

export class GetImpactMapDto {
  @ApiProperty()
  @IsString({ each: true })
  @IsNotEmpty()
  @Type(() => String)
  indicators!: string[];

  @ApiProperty()
  @IsString({ each: true })
  @IsNotEmpty()
  @Type(() => String)
  materials!: string[];

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  @IsSmallerOrEqualThan('endYear')
  startYear!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  @IsGreaterOrEqualThan('startYear')
  endYear!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ each: true })
  @Type(() => String)
  origins?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ each: true })
  @Type(() => String)
  suppliers?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Type(() => String)
  groupBy?: string;
}

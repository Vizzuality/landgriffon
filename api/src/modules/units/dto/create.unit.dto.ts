import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUnitDto {
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  @ApiProperty()
  name!: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  symbol?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  description?: string;
}

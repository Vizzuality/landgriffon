import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSourcingRecordDto {
  @IsNumber()
  @ApiProperty()
  tonnage!: number;

  @IsNumber()
  @ApiProperty()
  year!: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  sourcingLocationsId?: string;
}

export class CreateSourcingRecordV2 {
  @IsNumber()
  tonnage!: number;

  @IsNumber()
  year!: number;
}

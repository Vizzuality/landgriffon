import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateTargetDto {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  targetYear?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  value?: number;

  @IsOptional()
  @IsString()
  updatedById?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateTargetDto {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  year?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  value?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  lastEditedUserId?: string;
}

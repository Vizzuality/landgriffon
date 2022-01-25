import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTargetDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  baseLineYear!: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  year!: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  value!: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  indicatorId!: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  lastEditedUserId?: string;
}

import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateIndicatorDto } from 'modules/indicators/dto/create.indicator.dto';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateIndicatorDto extends PartialType(CreateIndicatorDto) {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(40)
  @ApiProperty()
  name?: string;
}

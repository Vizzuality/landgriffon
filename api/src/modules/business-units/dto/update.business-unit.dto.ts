import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateBusinessUnitDto } from 'modules/business-units/dto/create.business-unit.dto';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateBusinessUnitDto extends PartialType(CreateBusinessUnitDto) {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(40)
  @ApiProperty()
  name?: string;
}

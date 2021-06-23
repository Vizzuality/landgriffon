import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateBusinessUnitsDto } from 'modules/business-units/dto/create.business-units.dto';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateBusinessUnitsDto extends PartialType(
  CreateBusinessUnitsDto,
) {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(40)
  @ApiProperty()
  name?: string;
}

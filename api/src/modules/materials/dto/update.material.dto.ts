import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateMaterialDto } from 'modules/materials/dto/create.material.dto';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateMaterialDto extends PartialType(CreateMaterialDto) {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(40)
  @ApiPropertyOptional()
  name?: string;
}

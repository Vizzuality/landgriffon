import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateLayerDto } from 'modules/layers/dto/create.layer.dto';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateLayerDto extends PartialType(CreateLayerDto) {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(40)
  @ApiProperty()
  name?: string;
}

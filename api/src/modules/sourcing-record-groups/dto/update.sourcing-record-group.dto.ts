import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateSourcingRecordGroupDto } from 'modules/sourcing-record-groups/dto/create.sourcing-record-group.dto';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateSourcingRecordGroupDto extends PartialType(
  CreateSourcingRecordGroupDto,
) {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(40)
  @ApiProperty()
  title?: string;
}

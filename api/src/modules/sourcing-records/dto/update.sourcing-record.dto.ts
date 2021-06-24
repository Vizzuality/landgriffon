import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateSourcingRecordDto } from 'modules/sourcing-records/dto/create.sourcing-record.dto';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateSourcingRecordDto extends PartialType(
  CreateSourcingRecordDto,
) {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(40)
  @ApiProperty()
  name?: string;
}

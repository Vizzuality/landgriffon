import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateSourcingRecordDto } from 'modules/sourcing-records/dto/create.sourcing-record.dto';
import { IsNumber } from 'class-validator';

export class UpdateSourcingRecordDto extends PartialType(
  CreateSourcingRecordDto,
) {
  @IsNumber()
  @ApiPropertyOptional()
  tonnage?: number;

  @IsNumber()
  @ApiPropertyOptional()
  year?: number;
}

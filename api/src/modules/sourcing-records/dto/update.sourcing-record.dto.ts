import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateSourcingRecordDto } from 'modules/sourcing-records/dto/create.sourcing-record.dto';
import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class UpdateSourcingRecordDto extends PartialType(
  CreateSourcingRecordDto,
) {
  @IsNumber()
  @ApiPropertyOptional()
  tonnage?: number;

  @IsNumber()
  @ApiPropertyOptional()
  year?: number;

  @IsNotEmpty()
  @IsUUID()
  updatedById: string;
}

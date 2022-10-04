import { PartialType } from '@nestjs/swagger';
import { CreateSourcingLocationDto } from 'modules/sourcing-locations/dto/create.sourcing-location.dto';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateSourcingLocationDto extends PartialType(
  CreateSourcingLocationDto,
) {
  @IsNotEmpty()
  @IsUUID()
  updatedById: string;
}

import { PartialType } from '@nestjs/swagger';
import { CreateSourcingLocationDto } from 'modules/sourcing-locations/dto/create.sourcing-location.dto';

export class UpdateSourcingLocationDto extends PartialType(
  CreateSourcingLocationDto,
) {}

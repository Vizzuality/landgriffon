import { PartialType } from '@nestjs/swagger';
import { CreateApiEventDTO } from 'modules/api-events/dto/create.api-event.dto';

export class UpdateApiEventDTO extends PartialType(CreateApiEventDTO) {}

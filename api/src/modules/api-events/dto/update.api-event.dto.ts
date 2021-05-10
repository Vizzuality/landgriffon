import { PartialType } from '@nestjs/swagger';
import { CreateApiEventDTO } from './create.api-event.dto';

export class UpdateApiEventDTO extends PartialType(CreateApiEventDTO) {}

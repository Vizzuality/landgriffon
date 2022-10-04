import { PartialType } from '@nestjs/swagger';
import { CreateUnitDto } from 'modules/units/dto/create.unit.dto';

export class UpdateUnitDto extends PartialType(CreateUnitDto) {}

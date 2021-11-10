import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import { Unit, unitResource } from 'modules/units/unit.entity';
import { AppInfoDTO } from 'dto/info.dto';
import { UnitRepository } from 'modules/units/unit.repository';
import { CreateUnitDto } from 'modules/units/dto/create.unit.dto';
import { UpdateUnitDto } from 'modules/units/dto/update.unit.dto';

@Injectable()
export class UnitsService extends AppBaseService<
  Unit,
  CreateUnitDto,
  UpdateUnitDto,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(UnitRepository)
    protected readonly UnitRepository: UnitRepository,
  ) {
    super(UnitRepository, unitResource.name.singular, unitResource.name.plural);
  }

  get serializerConfig(): JSONAPISerializerConfig<Unit> {
    return {
      attributes: ['name', 'symbol', 'description'],
      keyForAttribute: 'camelCase',
    };
  }

  async getUnitById(id: number): Promise<Unit> {
    const found: Unit | undefined = await this.UnitRepository.findOne(id);

    if (!found) {
      throw new NotFoundException(` Unit with ID "${id}" not found`);
    }

    return found;
  }
}

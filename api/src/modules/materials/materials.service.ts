import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import { Material, materialResource } from 'modules/materials/material.entity';
import { AppInfoDTO } from 'dto/info.dto';
import { MaterialRepository } from 'modules/materials/material.repository';
import { CreateMaterialDto } from 'modules/materials/dto/create.material.dto';
import { UpdateMaterialDto } from 'modules/materials/dto/update.material.dto';

@Injectable()
export class MaterialsService extends AppBaseService<
  Material,
  CreateMaterialDto,
  UpdateMaterialDto,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(MaterialRepository)
    protected readonly materialRepository: MaterialRepository,
  ) {
    super(
      materialRepository,
      materialResource.name.singular,
      materialResource.name.plural,
    );
  }

  get serializerConfig(): JSONAPISerializerConfig<Material> {
    return {
      attributes: ['name', 'description', 'status', 'metadata'],
      keyForAttribute: 'camelCase',
    };
  }

  async getMaterialById(id: number): Promise<Material> {
    const found = await this.materialRepository.findOne(id);

    if (!found) {
      throw new NotFoundException(`Material with ID "${id}" not found`);
    }

    return found;
  }
}

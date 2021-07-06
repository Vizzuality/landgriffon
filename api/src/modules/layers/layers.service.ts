import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import { Layer, LayerResource } from 'modules/layers/layer.entity';
import { AppInfoDTO } from 'dto/info.dto';
import { LayerRepository } from 'modules/layers/layer.repository';
import { CreateLayerDto } from 'modules/layers/dto/create.layer.dto';
import { UpdateLayerDto } from 'modules/layers/dto/update.layer.dto';

@Injectable()
export class LayersService extends AppBaseService<
  Layer,
  CreateLayerDto,
  UpdateLayerDto,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(LayerRepository)
    protected readonly layerRepository: LayerRepository,
  ) {
    super(
      layerRepository,
      LayerResource.name.singular,
      LayerResource.name.plural,
    );
  }

  get serializerConfig(): JSONAPISerializerConfig<Layer> {
    return {
      attributes: ['id', 'text', 'layerManagerConfig', 'status', 'metadata'],
      keyForAttribute: 'camelCase',
    };
  }

  async getLayerById(id: number): Promise<Layer> {
    const found = await this.layerRepository.findOne(id);

    if (!found) {
      throw new NotFoundException(`Layer with ID "${id}" not found`);
    }

    return found;
  }
}

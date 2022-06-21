import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ContextualLayerRepository } from 'modules/contextual-layers/contextual-layer.repository';
import { ContextualLayer } from 'modules/contextual-layers/contextual-layer.entity';
import { groupBy } from 'lodash';

@Injectable()
export class ContextualLayersService {
  logger: Logger = new Logger();

  constructor(
    private readonly contextualLayerRepository: ContextualLayerRepository,
  ) {}

  async getContextualLayersByCategory(): Promise<any[]> {
    const contextualLayers: ContextualLayer[] =
      await this.contextualLayerRepository.find();

    if (!contextualLayers.length) {
      throw new NotFoundException('No contextual layers were found');
    }

    return Object.entries(
      groupBy(contextualLayers, (layer: ContextualLayer) => layer.category),
    ).map((category: any) => ({
      category: category[0],
      layers: category[1],
    }));
  }
}

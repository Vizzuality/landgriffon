import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ContextualLayerRepository } from 'modules/contextual-layers/contextual-layer.repository';
import { ContextualLayer } from 'modules/contextual-layers/contextual-layer.entity';
import { groupBy } from 'lodash';
import { H3Data, H3IndexValueData } from 'modules/h3-data/h3-data.entity';
import { H3DataService } from 'modules/h3-data/h3-data.service';

@Injectable()
export class ContextualLayersService {
  logger: Logger = new Logger();

  constructor(
    private readonly contextualLayerRepository: ContextualLayerRepository,
    private readonly h3dataService: H3DataService,
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

  async getContextualLayerH3(
    contextualLayerId: string,
    resolution?: number,
    year?: number,
  ): Promise<H3IndexValueData[]> {
    const h3Data: H3Data | undefined =
      await this.h3dataService.getContextualLayerH3DataByClosestYear(
        contextualLayerId,
        year,
      );

    if (!h3Data) {
      throw new NotFoundException(
        `No H3 Data could be found for contextual Layer with id ${contextualLayerId}`,
      );
    }

    return this.h3dataService.getSumH3ByNameAndResolution(
      h3Data.h3tableName,
      h3Data.h3columnName,
      resolution,
    );
  }
}

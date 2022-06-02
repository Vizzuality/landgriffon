import { EntityRepository, Repository } from 'typeorm';
import { ContextualLayer } from 'modules/contextual-layers/contextual-layer.entity';

@EntityRepository(ContextualLayer)
export class ContextualLayerRepository extends Repository<ContextualLayer> {}

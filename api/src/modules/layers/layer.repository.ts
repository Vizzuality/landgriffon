import { EntityRepository, Repository } from 'typeorm';
import { Layer } from 'modules/layers/layer.entity';

@EntityRepository(Layer)
export class LayerRepository extends Repository<Layer> {}

import { EntityRepository, Repository } from 'typeorm';
import { Layer } from 'modules/layers/layer.entity';

@EntityRepository(Layer)
export class LayersRepository extends Repository<Layer> {}

import { EntityRepository, Repository } from 'typeorm';
import { Layers } from './layers.entity';

@EntityRepository(Layers)
export class LayersRepository extends Repository<Layers> {}

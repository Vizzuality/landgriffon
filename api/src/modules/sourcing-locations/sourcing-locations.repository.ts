import { EntityRepository, Repository } from 'typeorm';
import { SourcingLocation } from './sourcing-location.entity';

@EntityRepository(SourcingLocation)
export class SourcingLocationsRepository extends Repository<SourcingLocation> {}

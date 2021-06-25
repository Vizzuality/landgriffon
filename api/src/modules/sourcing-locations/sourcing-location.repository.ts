import { EntityRepository, Repository } from 'typeorm';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';

@EntityRepository(SourcingLocation)
export class SourcingLocationRepository extends Repository<SourcingLocation> {}

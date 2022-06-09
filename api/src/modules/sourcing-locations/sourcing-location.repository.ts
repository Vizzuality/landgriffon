import { EntityRepository } from 'typeorm';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { AppBaseRepository } from 'utils/app-base.repository';

@EntityRepository(SourcingLocation)
export class SourcingLocationRepository extends AppBaseRepository<SourcingLocation> {}

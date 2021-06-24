import { EntityRepository, Repository } from 'typeorm';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';

@EntityRepository(AdminRegion)
export class AdminRegionsRepository extends Repository<AdminRegion> {}

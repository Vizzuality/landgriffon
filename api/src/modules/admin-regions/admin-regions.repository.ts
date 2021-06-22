import { EntityRepository, Repository } from 'typeorm';
import { AdminRegions } from './admin-regions.entity';

@EntityRepository(AdminRegions)
export class AdminRegionsRepository extends Repository<AdminRegions> {}

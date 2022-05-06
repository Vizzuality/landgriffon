import { LOCATION_TYPES } from 'modules/sourcing-locations/sourcing-location.entity';
import { ImpactTableEntityType } from 'types/impact-table-entity.type';
import { PaginationMeta } from 'utils/app-base.service';
export class PaginatedEntitiesDto {
  entities: ImpactTableEntityType[] | LocationTypeEntities[];
  metadata?: PaginationMeta;
}

export class LocationTypeEntities {
  name: LOCATION_TYPES;
  children: any;
}

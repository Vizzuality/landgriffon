import { ImpactTableEntityType } from 'types/impact-table-entity.type';
import { PaginationMeta } from 'utils/app-base.service';
export class PaginatedEntitiesDto {
  entities: ImpactTableEntityType[];
  metadata?: PaginationMeta;
}

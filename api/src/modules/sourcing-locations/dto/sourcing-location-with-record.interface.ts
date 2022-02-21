import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';

export interface SourcingLocationWithRecord extends SourcingLocation {
  year: number;
  tonnage: number;
}

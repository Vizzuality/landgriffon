import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';

export abstract class GeoCodingAbstractClass {
  abstract geoCodeLocations(
    sourcingData: SourcingData[],
  ): Promise<SourcingLocation[]>;
}

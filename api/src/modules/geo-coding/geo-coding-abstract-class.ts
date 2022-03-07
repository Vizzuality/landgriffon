import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';

export abstract class GeoCodingAbstractClass {
  abstract geoCodeLocations(
    sourcingData: SourcingData[],
  ): Promise<SourcingData[]>;
}

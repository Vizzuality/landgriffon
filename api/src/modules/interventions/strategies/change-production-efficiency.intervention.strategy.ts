import { Injectable } from '@nestjs/common';
import {
  SOURCING_LOCATION_TYPE_BY_INTERVENTION,
  SourcingLocation,
} from 'modules/sourcing-locations/sourcing-location.entity';

@Injectable()
export class ChangeProductionEfficiencyIntervention {
  generateNewLocationForChangeProductionEfficiency(
    sourcingLocations: SourcingLocation[],
  ): SourcingLocation[] {
    const newLocations: SourcingLocation[] = [];
    for (const location of sourcingLocations) {
      const newCancelledInterventionLocation: SourcingLocation =
        new SourcingLocation();
      newCancelledInterventionLocation.materialId = location.materialId;
      newCancelledInterventionLocation.locationType = location.locationType;
      newCancelledInterventionLocation.locationCountryInput =
        location.locationCountryInput;
      newCancelledInterventionLocation.locationAddressInput =
        location.locationAddressInput;
      newCancelledInterventionLocation.locationLatitude =
        location.locationLatitude;
      newCancelledInterventionLocation.locationLongitude =
        location.locationLongitude;
      newCancelledInterventionLocation.t1SupplierId = location.t1SupplierId;
      newCancelledInterventionLocation.producerId = location.producerId;
      newCancelledInterventionLocation.businessUnitId = location.businessUnitId;
      newCancelledInterventionLocation.geoRegionId = location.geoRegionId;
      newCancelledInterventionLocation.adminRegionId = location.adminRegionId;
      newCancelledInterventionLocation.sourcingRecords =
        location.sourcingRecords;
      newCancelledInterventionLocation.interventionType =
        SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING;
      newLocations.push(newCancelledInterventionLocation);
    }

    return newLocations;
  }
}

import { Injectable } from '@nestjs/common';
import { CreateScenarioInterventionDto } from 'modules/scenario-interventions/dto/create.scenario-intervention.dto';
import {
  SOURCING_LOCATION_TYPE_BY_INTERVENTION,
  SourcingLocation,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';

@Injectable()
export class NewMaterialIntervention {
  /**
   * In case of New Material Intervention only 1 new Sourcing Location will be created, it will have the material, suppliers and supplier's location
   * received from user in create-intervention dto. However, the tonnage of the New Intervention must be taken as a sum of all tonnages of the Sourcing Locations
   * that are being canceled by the Intervention, and multiplied by the percentage selected by the user
   */
  generateNewSourcingLocation(
    dto: CreateScenarioInterventionDto,
    sourcingData: SourcingLocation[],
    locationData: {
      adminRegionId: string;
      geoRegionId: string;
      locationWarning: string | undefined;
    },
  ): SourcingLocation[] {
    const intervenedSourcingRecords: SourcingRecord[] = [];
    /**
     * For each year in SourcingRecords, sum up all tonnages for that year
     */
    sourcingData.forEach((sourcingLocation: SourcingLocation) => {
      sourcingLocation.sourcingRecords.forEach(
        (sourcingRecord: SourcingRecord) => {
          const sr: { year: number; tonnage: number } | undefined =
            intervenedSourcingRecords.find(
              (elem: { year: number; tonnage: number }) =>
                elem.year === sourcingRecord.year,
            );
          if (sr) sr.tonnage += Number(sourcingRecord.tonnage);
          else
            intervenedSourcingRecords.push({
              year: sourcingRecord.year,
              tonnage: Number(sourcingRecord.tonnage),
            } as SourcingRecord);
        },
      );
    });

    const newInterventionLocationDataForGeoCoding: SourcingLocation = {
      materialId: dto.newMaterialId as string,
      locationType: dto.newLocationType,
      locationAddressInput: dto.newLocationAddressInput,
      locationCountryInput: dto.newLocationCountryInput,
      locationLongitude: dto.newLocationLongitude,
      locationLatitude: dto.newLocationLatitude,
      t1SupplierId: dto.newT1SupplierId,
      producerId: dto.newProducerId,
      businessUnitId: sourcingData[0].businessUnitId,
      sourcingRecords: intervenedSourcingRecords,
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
      adminRegionId: locationData.adminRegionId,
      geoRegionId: locationData.geoRegionId,
      locationWarning: locationData.locationWarning,
    } as SourcingLocation;

    return [newInterventionLocationDataForGeoCoding];
  }
}

import { Injectable } from '@nestjs/common';
import { CreateInterventionDto } from 'modules/interventions/dto/create.intervention.dto';
import {
  SOURCING_LOCATION_TYPE_BY_INTERVENTION,
  SourcingLocation,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';

@Injectable()
export class NewSupplierLocationIntervention {
  generateNewReplacingSourcingLocationsForNewSupplierIntervention(
    dto: CreateInterventionDto,
    sourcingData: SourcingLocation[],
    locationData: {
      adminRegionId: string;
      geoRegionId: string;
      locationWarning: string | undefined;
    },
  ): SourcingLocation[] {
    const newSourcingLocationData: SourcingLocation[] = [];
    for (const location of sourcingData) {
      const identicalSourcingLocationDataIndex: number | undefined =
        newSourcingLocationData.findIndex(
          (el: SourcingLocation) =>
            location.materialId === el.materialId &&
            location.businessUnitId === el.businessUnitId,
        );

      if (identicalSourcingLocationDataIndex >= 0) {
        newSourcingLocationData[
          identicalSourcingLocationDataIndex
        ].sourcingRecords = this.updateNewSupplierLocationTonnage(
          newSourcingLocationData,
          identicalSourcingLocationDataIndex,
          location.sourcingRecords,
        );
      } else {
        const newInterventionLocation: SourcingLocation = {
          materialId: location.materialId,
          locationType: dto.newLocationType,
          locationAddressInput: dto.newLocationAddressInput,
          locationCountryInput: dto.newLocationCountryInput,
          locationLatitude: dto.newLocationLatitude,
          locationLongitude: dto.newLocationLongitude,
          t1SupplierId: dto.newT1SupplierId,
          producerId: dto.newProducerId,
          businessUnitId: location.businessUnitId,
          geoRegionId: locationData.geoRegionId,
          adminRegionId: locationData.adminRegionId,
          locationWarning: locationData.locationWarning,
          sourcingRecords: location.sourcingRecords,
          interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
        } as SourcingLocation;

        newSourcingLocationData.push(newInterventionLocation);
      }
    }

    return newSourcingLocationData;
  }

  private updateNewSupplierLocationTonnage(
    existingSourcingLocations: SourcingLocation[],
    index: number,
    newSourcingRecords: SourcingRecord[],
  ): SourcingRecord[] {
    const joinedRecords: { year: number; tonnage: number }[] =
      existingSourcingLocations[index].sourcingRecords.concat(
        newSourcingRecords,
      );

    const mergedRecords: { year: SourcingRecord } = joinedRecords.reduce(
      (acc: any, sourcingRecords: { year: number; tonnage: number }) => {
        acc[sourcingRecords.year] = {
          year: sourcingRecords.year,
          tonnage:
            (acc[sourcingRecords.year]
              ? Number(acc[sourcingRecords.year].tonnage)
              : 0) + Number(sourcingRecords.tonnage),
        };
        return acc;
      },
      {},
    );

    return Object.values(mergedRecords);
  }
}

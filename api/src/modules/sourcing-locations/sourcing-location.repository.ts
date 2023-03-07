import {
  Brackets,
  DataSource,
  SelectQueryBuilder,
  WhereExpressionBuilder,
} from 'typeorm';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { GetLocationTypesDto } from 'modules/sourcing-locations/dto/location-types-options.sourcing-locations.dto';
import { AppBaseRepository } from 'utils/app-base.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  INTERVENTION_STATUS,
  Intervention,
} from 'modules/interventions/intervention.entity';

@Injectable()
export class SourcingLocationRepository extends AppBaseRepository<SourcingLocation> {
  constructor(protected dataSource: DataSource) {
    super(SourcingLocation, dataSource.createEntityManager());
  }

  async getAvailableLocationTypes(
    locationTypesOptions: GetLocationTypesDto,
  ): Promise<{ locationType: string }[]> {
    const queryBuilder: SelectQueryBuilder<SourcingLocation> =
      this.createQueryBuilder('sl')
        .select('sl.locationType', 'locationType')
        .distinct();
    if (locationTypesOptions.materialIds) {
      queryBuilder.andWhere('sl.materialId IN (:...materialIds)', {
        materialIds: locationTypesOptions.materialIds,
      });
    }
    if (locationTypesOptions.supplierIds) {
      queryBuilder.andWhere(
        new Brackets((qb: WhereExpressionBuilder) => {
          qb.where('sl."t1SupplierId" IN (:...suppliers)', {
            suppliers: locationTypesOptions.supplierIds,
          }).orWhere('sl."producerId" IN (:...suppliers)', {
            suppliers: locationTypesOptions.supplierIds,
          });
        }),
      );
    }
    if (locationTypesOptions.businessUnitIds) {
      queryBuilder.andWhere('sl.businessUnitId IN (:...businessUnitIds)', {
        businessUnitIds: locationTypesOptions.businessUnitIds,
      });
    }
    if (locationTypesOptions.originIds) {
      queryBuilder.andWhere('sl.adminRegionId IN (:...originIds)', {
        originIds: locationTypesOptions.originIds,
      });
    }

    if (locationTypesOptions.locationTypes) {
      queryBuilder.andWhere('sl.locationType IN (:...locationTypes)', {
        locationTypes: locationTypesOptions.locationTypes,
      });
    }

    if (locationTypesOptions.scenarioIds) {
      queryBuilder.leftJoin(
        Intervention,
        'scenarioIntervention',
        'sl.scenarioInterventionId = scenarioIntervention.id',
      );
      queryBuilder.andWhere(
        new Brackets((qb: WhereExpressionBuilder) => {
          qb.where('sl.scenarioInterventionId is null').orWhere(
            new Brackets((qbInterv: WhereExpressionBuilder) => {
              qbInterv
                .where('scenarioIntervention.scenarioId IN (:...scenarioIds)', {
                  scenarioIds: locationTypesOptions.scenarioIds,
                })
                .andWhere(`scenarioIntervention.status = :status`, {
                  status: INTERVENTION_STATUS.ACTIVE,
                });
            }),
          );
        }),
      );
    } else {
      queryBuilder.andWhere('sl.scenarioInterventionId is null');
      queryBuilder.andWhere('sl.interventionType is null');
    }

    queryBuilder.orderBy(
      'sl.locationType',
      locationTypesOptions.sort ?? 'DESC',
    );

    const locationTypes: { locationType: string }[] =
      await queryBuilder.getRawMany();

    if (!locationTypes) {
      throw new NotFoundException(`No Location Types were found`);
    }

    return locationTypes;
  }
}

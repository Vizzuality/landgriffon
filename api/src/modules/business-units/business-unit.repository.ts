import {
  Brackets,
  EntityRepository,
  SelectQueryBuilder,
  WhereExpressionBuilder,
} from 'typeorm';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { ExtendedTreeRepository } from 'utils/tree.repository';
import { CreateBusinessUnitDto } from 'modules/business-units/dto/create.business-unit.dto';
import { Logger } from '@nestjs/common';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { GetBusinessUnitTreeWithOptionsDto } from 'modules/business-units/dto/get-business-unit-tree-with-options.dto';
import { ScenarioIntervention } from 'modules/scenario-interventions/scenario-intervention.entity';

@EntityRepository(BusinessUnit)
export class BusinessUnitRepository extends ExtendedTreeRepository<
  BusinessUnit,
  CreateBusinessUnitDto
> {
  logger: Logger = new Logger(BusinessUnitRepository.name);

  /**
   * @description Get all business units that are present in Sourcing Locations with given filters
   *              Additionally if withAncestry set to true (default) it will return the ancestry of each
   *              element up to the root
   */
  async getBusinessUnitsFromSourcingLocations(
    businessUnitTreeOptions: GetBusinessUnitTreeWithOptionsDto,
    withAncestry: boolean = true,
  ): Promise<BusinessUnit[]> {
    // Join and filters over business-units present in sourcing-locations. Resultant query returns IDs of elements meeting the filters
    const queryBuilder: SelectQueryBuilder<BusinessUnit> =
      this.createQueryBuilder('bu')
        .innerJoin(SourcingLocation, 'sl', 'sl.businessUnitId = bu.id')
        .distinct(true);

    if (businessUnitTreeOptions.supplierIds) {
      queryBuilder.andWhere(
        new Brackets((qb: WhereExpressionBuilder) => {
          qb.where('sl."t1SupplierId" IN (:...suppliers)', {
            suppliers: businessUnitTreeOptions.supplierIds,
          }).orWhere('sl."producerId" IN (:...suppliers)', {
            suppliers: businessUnitTreeOptions.supplierIds,
          });
        }),
      );
    }
    if (businessUnitTreeOptions.materialIds) {
      queryBuilder.andWhere('sl.materialId IN (:...materialIds)', {
        materialIds: businessUnitTreeOptions.materialIds,
      });
    }
    if (businessUnitTreeOptions.originIds) {
      queryBuilder.andWhere('sl.adminRegionId IN (:...originIds)', {
        originIds: businessUnitTreeOptions.originIds,
      });
    }

    if (businessUnitTreeOptions.locationTypes) {
      queryBuilder.andWhere('sl.locationType IN (:...locationTypes)', {
        locationTypes: businessUnitTreeOptions.locationTypes,
      });
    }

    if (
      businessUnitTreeOptions.scenarioIds ||
      businessUnitTreeOptions.scenarioId
    ) {
      queryBuilder.leftJoin(
        ScenarioIntervention,
        'scenarioIntervention',
        'sl.scenarioInterventionId = scenarioIntervention.id',
      );
      if (businessUnitTreeOptions.scenarioIds) {
        queryBuilder.andWhere(
          new Brackets((qb: WhereExpressionBuilder) => {
            qb.where('scenarioIntervention.scenarioId IN (:...scenarioIds)', {
              scenarioIds: businessUnitTreeOptions.scenarioIds,
            }).orWhere('sl.scenarioInterventionId is null');
          }),
        );
      } else if (businessUnitTreeOptions.scenarioIds) {
        queryBuilder.andWhere(
          new Brackets((qb: WhereExpressionBuilder) => {
            qb.where('scenarioIntervention.scenarioId = :scenarioId', {
              scenarioId: businessUnitTreeOptions.scenarioId,
            }).orWhere('sl.scenarioInterventionId is null');
          }),
        );
      }
    } else {
      queryBuilder.andWhere('sl.scenarioInterventionId is null');
      queryBuilder.andWhere('sl.interventionType is null');
    }

    if (!withAncestry) {
      return queryBuilder.getMany();
    }
    queryBuilder.select('bu.id');

    // Recursively find elements and their ancestry given Ids of the subquery above
    return this.getEntityAncestry<BusinessUnit>(
      queryBuilder,
      BusinessUnit.name,
    );
  }
}

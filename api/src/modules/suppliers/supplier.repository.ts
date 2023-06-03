import {
  Brackets,
  DataSource,
  SelectQueryBuilder,
  WhereExpressionBuilder,
} from 'typeorm';
import { Supplier, SUPPLIER_TYPES } from 'modules/suppliers/supplier.entity';
import { ExtendedTreeRepository } from 'utils/tree.repository';
import { CreateSupplierDto } from 'modules/suppliers/dto/create.supplier.dto';
import { Injectable, Logger } from '@nestjs/common';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { GetSupplierTreeWithOptions } from 'modules/suppliers/dto/get-supplier-tree-with-options.dto';
import {
  SCENARIO_INTERVENTION_STATUS,
  ScenarioIntervention,
} from 'modules/scenario-interventions/scenario-intervention.entity';
import { GetSupplierByType } from 'modules/suppliers/dto/get-supplier-by-type.dto';
import { BaseQueryBuilder } from 'utils/base.query-builder';

@Injectable()
export class SupplierRepository extends ExtendedTreeRepository<
  Supplier,
  CreateSupplierDto
> {
  logger: Logger = new Logger(SupplierRepository.name);

  constructor(private dataSource: DataSource) {
    super(Supplier, dataSource.createEntityManager());
  }

  /**
   * @description Get all suppliers that are present in Sourcing Locations with given filters
   *              Additionally if withAncestry set to true (default) it will return the ancestry of each
   *              element up to the root
   *
   *@deprecated: This function is deprecated and will be removed in the future. Use getSuppliersFromSourcingLocationsV2 instead
   *
   */

  async getSuppliersFromSourcingLocations(
    supplierTreeOptions: GetSupplierTreeWithOptions,
    withAncestry: boolean = true,
  ): Promise<Supplier[]> {
    // Join and filters over materials present in sourcing-locations. Resultant query returns IDs of elements meeting the filters
    const queryBuilder: SelectQueryBuilder<Supplier> = this.createQueryBuilder(
      's',
    )
      .innerJoin(
        SourcingLocation,
        'sl',
        '(s.id = sl.t1SupplierId OR s.id = sl.producerId)',
      )
      .distinct(true);

    if (supplierTreeOptions.supplierIds) {
      queryBuilder.andWhere('s.id IN (:...supplierIds)', {
        supplierIds: supplierTreeOptions.supplierIds,
      });
    }
    if (supplierTreeOptions.materialIds) {
      queryBuilder.andWhere('sl.materialId IN (:...materialIds)', {
        materialIds: supplierTreeOptions.materialIds,
      });
    }
    if (supplierTreeOptions.businessUnitIds) {
      queryBuilder.andWhere('sl.businessUnitId IN (:...businessUnitIds)', {
        businessUnitIds: supplierTreeOptions.businessUnitIds,
      });
    }
    if (supplierTreeOptions.originIds) {
      queryBuilder.andWhere('sl.adminRegionId IN (:...originIds)', {
        originIds: supplierTreeOptions.originIds,
      });
    }

    if (supplierTreeOptions.locationTypes) {
      queryBuilder.andWhere('sl.locationType IN (:...locationTypes)', {
        locationTypes: supplierTreeOptions.locationTypes,
      });
    }

    if (supplierTreeOptions.scenarioIds) {
      queryBuilder.leftJoin(
        ScenarioIntervention,
        'scenarioIntervention',
        'sl.scenarioInterventionId = scenarioIntervention.id',
      );
      queryBuilder.andWhere(
        new Brackets((qb: WhereExpressionBuilder) => {
          qb.where('sl.scenarioInterventionId is null').orWhere(
            new Brackets((qbInterv: WhereExpressionBuilder) => {
              qbInterv
                .where('scenarioIntervention.scenarioId IN (:...scenarioIds)', {
                  scenarioIds: supplierTreeOptions.scenarioIds,
                })
                .andWhere(`scenarioIntervention.status = :status`, {
                  status: SCENARIO_INTERVENTION_STATUS.ACTIVE,
                });
            }),
          );
        }),
      );
    } else {
      queryBuilder.andWhere('sl.scenarioInterventionId is null');
      queryBuilder.andWhere('sl.interventionType is null');
    }

    if (!withAncestry) {
      return queryBuilder.getMany();
    }
    queryBuilder.select('s.id');

    return this.getEntityAncestry<Supplier>(queryBuilder, Supplier.name);
  }

  async getSuppliersFromSourcingLocationsV2(
    options: GetSupplierByType,
  ): Promise<Supplier[]> {
    const initialQueryBuilder: SelectQueryBuilder<Supplier> =
      this.createQueryBuilder('s').distinct(true);
    initialQueryBuilder.orderBy('s.name', options.sort ?? 'ASC');
    if (options.type === SUPPLIER_TYPES.T1SUPPLIER) {
      initialQueryBuilder.innerJoin(
        SourcingLocation,
        'sl',
        'sl.t1SupplierId = s.id',
      );
    }
    if (options.type === SUPPLIER_TYPES.PRODUCER) {
      initialQueryBuilder.innerJoin(
        SourcingLocation,
        'sl',
        'sl.producerId = s.id',
      );
    }
    const queryBuilder: SelectQueryBuilder<Supplier> =
      BaseQueryBuilder.addFilters(initialQueryBuilder, options);

    return queryBuilder.getMany();
  }
}

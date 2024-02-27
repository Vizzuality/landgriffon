import {
  Brackets,
  ObjectLiteral,
  SelectQueryBuilder,
  WhereExpressionBuilder,
} from 'typeorm';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { LOCATION_TYPES } from 'modules/sourcing-locations/sourcing-location.entity';
import { Type } from 'class-transformer';
import {
  SCENARIO_INTERVENTION_STATUS,
  ScenarioIntervention,
} from 'modules/scenario-interventions/scenario-intervention.entity';

/**
 * @description Utility to manipulate a query builder with common operations for different repositories
 */

export class BaseQueryBuilder {
  static addFilters<Entity extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<Entity>,
    filters: CommonFiltersDto,
  ): SelectQueryBuilder<Entity> {
    if (filters.materialIds) {
      queryBuilder.andWhere('sl.materialId IN (:...materialIds)', {
        materialIds: filters.materialIds,
      });
    }
    if (filters.t1SupplierIds) {
      queryBuilder.andWhere('sl."t1SupplierId" IN (:...t1SupplierIds)', {
        t1SupplierIds: filters.t1SupplierIds,
      });
    }
    if (filters.producerIds) {
      queryBuilder.andWhere('sl."producerId" IN (:...producerIds)', {
        producerIds: filters.producerIds,
      });
    }
    if (filters.businessUnitIds) {
      queryBuilder.andWhere('sl.businessUnitId IN (:...businessUnitIds)', {
        businessUnitIds: filters.businessUnitIds,
      });
    }
    if (filters.originIds) {
      queryBuilder.andWhere('sl.adminRegionId IN (:...originIds)', {
        originIds: filters.originIds,
      });
    }
    if (filters.eudr) {
      queryBuilder.andWhere('sl.locationType = :eudr', {
        eudr: LOCATION_TYPES.EUDR,
      });
    } else if (filters.locationTypes) {
      queryBuilder.andWhere('sl.locationType IN (:...locationTypes)', {
        locationTypes: filters.locationTypes,
      });
    }

    if (filters.scenarioIds) {
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
                  scenarioIds: filters.scenarioIds,
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

    return queryBuilder;
  }
}

export class CommonFiltersDto {
  @IsUUID('4', { each: true })
  @ApiPropertyOptional({ name: 't1SupplierIds[]' })
  @IsOptional()
  t1SupplierIds?: string[];

  @IsUUID('4', { each: true })
  @ApiPropertyOptional({ name: 'producerIds[]' })
  @IsOptional()
  producerIds?: string[];

  @IsUUID('4', { each: true })
  @ApiPropertyOptional({ name: 'businessUnitIds[]' })
  @IsOptional()
  businessUnitIds?: string[];

  @IsUUID('4', { each: true })
  @ApiPropertyOptional({ name: 'originIds[]' })
  @IsOptional()
  originIds?: string[];

  @IsUUID('4', { each: true })
  @ApiPropertyOptional({ name: 'materialIds[]' })
  @IsOptional()
  materialIds?: string[];

  @ApiPropertyOptional({
    description: 'Types of Sourcing Locations, written with hyphens',
    enum: Object.values(LOCATION_TYPES),
    name: 'locationTypes[]',
  })
  @IsOptional()
  @IsEnum(LOCATION_TYPES, {
    each: true,
    message:
      'Available options: ' +
      Object.values(LOCATION_TYPES).toString().toLowerCase(),
  })
  @Type(() => String)
  locationTypes?: LOCATION_TYPES[];

  @ApiPropertyOptional({
    description: 'Array of Scenario Ids to include entities present in them',
  })
  @IsOptional()
  @IsUUID('4', { each: true })
  scenarioIds?: string[];

  eudr?: boolean;
}

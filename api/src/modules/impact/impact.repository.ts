import { Repository, getManager, SelectQueryBuilder } from 'typeorm';
import {
  BaseImpactTableDto,
  GetActualVsScenarioImpactTableDto,
} from 'modules/impact/dto/impact-table.dto';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import { Indicator } from 'modules/indicators/indicator.entity';
import { Material } from 'modules/materials/material.entity';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';

/**
 * @description: Even to Impact is not a mapped entity in our codebase, we will use
 * this repository to centralise all data layer access regarding Impact
 * It is not included in the module
 */

// TODO: Refactor tu use this repository for all Impact Related data retrieval (Currently using Sourcing Records repo for this purpose)

export class ImpactRepository extends Repository<any> {
  private createBasicSelectQuery(
    impactDataDto: GetActualVsScenarioImpactTableDto | BaseImpactTableDto,
  ): SelectQueryBuilder<SourcingRecord> {
    return getManager()
      .createQueryBuilder()
      .select('sourcingRecords.year', 'year')
      .addSelect('sum(sourcingRecords.tonnage)', 'tonnes')
      .addSelect('sum(indicatorRecord.value)', 'impact')
      .addSelect('indicator.id', 'indicatorId')
      .addSelect('sourcingLocation.interventionType', 'typeByIntervention')
      .from(SourcingRecord, 'sourcingRecords')
      .leftJoin(
        SourcingLocation,
        'sourcingLocation',
        'sourcingLocation.id = sourcingRecords.sourcingLocationId',
      )
      .leftJoin(
        IndicatorRecord,
        'indicatorRecord',
        'indicatorRecord.sourcingRecordId = sourcingRecords.id',
      )
      .leftJoin(
        Indicator,
        'indicator',
        'indicator.id = indicatorRecord.indicatorId',
      )
      .leftJoin(
        Material,
        'material',
        'material.id = sourcingLocation.materialId',
      )
      .leftJoin(
        AdminRegion,
        'adminRegion',
        'sourcingLocation.adminRegionId = adminRegion.id ',
      )
      .leftJoin(
        Supplier,
        'supplier',
        'sourcingLocation.producerId = supplier.id or sourcingLocation.t1SupplierId = supplier.id',
      )
      .leftJoin(
        BusinessUnit,
        'businessUnit',
        'sourcingLocation.businessUnitId = businessUnit.id',
      )

      .where('sourcingRecords.year BETWEEN :startYear and :endYear', {
        startYear: impactDataDto.startYear,
        endYear: impactDataDto.endYear,
      })
      .andWhere('indicator.id IN (:...indicatorIds)', {
        indicatorIds: impactDataDto.indicatorIds,
      });
  }
  // use getManager() from typeorm to perform queries
}

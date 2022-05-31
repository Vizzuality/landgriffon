import {
  EntityRepository,
  getManager,
  Repository,
  SelectQueryBuilder,
  WhereExpressionBuilder,
  Brackets,
} from 'typeorm';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import {
  SourcingLocation,
  SOURCING_LOCATION_TYPE_BY_INTERVENTION,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { GetImpactTableDto } from 'modules/impact/dto/get-impact-table.dto';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import { Indicator } from 'modules/indicators/indicator.entity';
import { Material } from 'modules/materials/material.entity';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { Logger, NotFoundException } from '@nestjs/common';
import { GROUP_BY_VALUES } from 'modules/h3-data/dto/get-impact-map.dto';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { SourcingRecordsWithIndicatorRawDataDto } from 'modules/sourcing-records/dto/sourcing-records-with-indicator-raw-data.dto';
import { MissingH3DataError } from 'modules/indicator-records/errors/missing-h3-data.error';
import { ScenarioIntervention } from 'modules/scenario-interventions/scenario-intervention.entity';

export class ImpactTableData {
  year: number;
  indicatorId: string;
  indicatorShortName: string;
  name: string;
  tonnes: string;
  impact: number;
  scenarioInterventionId: string | null;
  typeByIntervention: SOURCING_LOCATION_TYPE_BY_INTERVENTION | null;
}

@EntityRepository(SourcingRecord)
export class SourcingRecordRepository extends Repository<SourcingRecord> {
  logger: Logger = new Logger(SourcingRecordRepository.name);

  async getYears(materialIds?: string[]): Promise<number[]> {
    const queryBuilder: SelectQueryBuilder<SourcingRecord> =
      this.createQueryBuilder('sr')
        .select('year')
        .distinct(true)
        .orderBy('year', 'ASC');

    if (materialIds) {
      queryBuilder.leftJoin(
        SourcingLocation,
        'sl',
        'sl.id = sr."sourcingLocationId"',
      );
      queryBuilder.andWhere('"sl"."materialId" IN (:...materialIds)', {
        materialIds,
      });
    }
    const sourcingRecordsYears: SourcingRecord[] =
      await queryBuilder.getRawMany();

    return sourcingRecordsYears.map((elem: { year: number }) => elem.year);
  }

  async getDataForImpactTable(
    getImpactTaleDto: GetImpactTableDto,
  ): Promise<ImpactTableData[]> {
    const {
      startYear,
      endYear,
      indicatorIds,
      materialIds,
      originIds,
      groupBy,
      supplierIds,
      locationTypes,
      scenarioId,
    } = getImpactTaleDto;

    const impactDataQueryBuilder: SelectQueryBuilder<SourcingRecord> =
      this.createQueryBuilder('sourcingRecords')
        .select('sourcingRecords.year', 'year')
        .addSelect('sum(sourcingRecords.tonnage)', 'tonnes')
        .addSelect('sum(indicatorRecord.value)', 'impact')
        .addSelect('indicator.id', 'indicatorId')
        .addSelect('sourcingLocation.interventionType', 'type')
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
          startYear,
          endYear,
        })
        .andWhere('indicator.id IN (:...indicatorIds)', { indicatorIds });

    // FILTERS

    // If Impact table is for scenario - scenarioId filter shall be added, else only SLs not belonging to interventions shall be chosen

    let scenarioInterventionIds: string[] = [];
    if (scenarioId) {
      const scenarioInterventions: { id: string }[] = await getManager()
        .createQueryBuilder()
        .select('id')
        .from('scenario_interventions', 'si')
        .where('si."scenarioId" = :scenarioId', { scenarioId })
        .getRawMany();

      scenarioInterventionIds = scenarioInterventions.map((si) => si.id);
    }

    if (scenarioInterventionIds.length > 0) {
      impactDataQueryBuilder.andWhere(
        'sourcingLocation.scenarioInterventionId Id IN (:...scenarioInterventionIds)',
        {
          scenarioInterventionIds,
        },
      );
    } else {
      impactDataQueryBuilder.andWhere(
        'sourcingLocation.scenarioInterventionId is null',
      );
    }

    // User chosen Filters

    if (materialIds) {
      impactDataQueryBuilder.andWhere(
        'sourcingLocation.materialId IN (:...materialIds)',
        {
          materialIds,
        },
      );
    }
    if (originIds) {
      impactDataQueryBuilder.andWhere(
        'sourcingLocation.adminRegionId IN (:...originIds)',
        {
          originIds,
        },
      );
    }
    if (supplierIds) {
      impactDataQueryBuilder.andWhere(
        new Brackets((qb: WhereExpressionBuilder) => {
          qb.where('sourcingLocation.t1SupplierId IN (:...supplierIds)', {
            supplierIds,
          }).orWhere('sourcingLocation.producerId IN (:...supplierIds)', {
            supplierIds,
          });
        }),
      );
    }

    if (locationTypes) {
      const sourcingLocationTypes: string[] = locationTypes.map(
        (el: LOCATION_TYPES_PARAMS) => {
          return el.replace(/-/g, ' ');
        },
      );
      impactDataQueryBuilder.andWhere(
        'sourcingLocation.locationType IN (:...sourcingLocationTypes)',
        {
          sourcingLocationTypes,
        },
      );
    }
    //GROUPING BY
    switch (groupBy) {
      case GROUP_BY_VALUES.MATERIAL:
        impactDataQueryBuilder
          .addSelect('material.name', 'name')
          .groupBy('material.name');
        break;
      case GROUP_BY_VALUES.REGION:
        impactDataQueryBuilder
          .addSelect('adminRegion.name', 'name')
          .groupBy('adminRegion.name');
        break;
      case GROUP_BY_VALUES.SUPPLIER:
        impactDataQueryBuilder
          .addSelect('supplier.name', 'name')
          .andWhere('supplier.name IS NOT NULL')
          .groupBy('supplier.name');
        break;
      case GROUP_BY_VALUES.BUSINESS_UNIT:
        impactDataQueryBuilder
          .addSelect('businessUnit.name', 'name')
          .groupBy('businessUnit.name');
        break;
      case GROUP_BY_VALUES.LOCATION_TYPE:
        impactDataQueryBuilder
          .addSelect('sourcingLocation.locationType', 'name')
          .groupBy('sourcingLocation.locationType');
        break;
      default:
    }
    impactDataQueryBuilder
      .addGroupBy(`sourcingRecords.year, indicator.id`)
      .orderBy('year', 'ASC')
      .orderBy('name');
    const dataForImpactTable: ImpactTableData[] =
      await impactDataQueryBuilder.getRawMany();
    if (!dataForImpactTable.length) {
      throw new NotFoundException(
        'Data required for building Impact Table could not been retrieved from DB',
      );
    }
    return dataForImpactTable;
  }
}

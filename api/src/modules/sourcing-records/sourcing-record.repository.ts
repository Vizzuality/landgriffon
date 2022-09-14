import {
  Brackets,
  EntityRepository,
  Repository,
  SelectQueryBuilder,
  WhereExpressionBuilder,
} from 'typeorm';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import {
  SourcingLocation,
  SOURCING_LOCATION_TYPE_BY_INTERVENTION,
} from 'modules/sourcing-locations/sourcing-location.entity';
import {
  GetActualVsScenarioImpactTabledto,
  GetImpactTableDto,
} from 'modules/impact/dto/get-impact-table.dto';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import { Indicator } from 'modules/indicators/indicator.entity';
import { Material } from 'modules/materials/material.entity';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { Logger, NotFoundException } from '@nestjs/common';
import { GROUP_BY_VALUES } from 'modules/h3-data/dto/get-impact-map.dto';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { Scenario } from 'modules/scenarios/scenario.entity';
import { ScenarioIntervention } from 'modules/scenario-interventions/scenario-intervention.entity';

export class ImpactTableData {
  year: number;
  indicatorId: string;
  indicatorShortName: string;
  name: string;
  tonnes: string;
  impact: number;
}

export class ActualVsScenarioImpactTableData extends ImpactTableData {
  scenarioImpact?: number;
  absoluteDifference?: number;
  percentageDifference?: number;
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
        .where('sr.tonnage > 0')
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
    const impactDataQueryBuilder: SelectQueryBuilder<SourcingRecord> =
      this.createBasicSelectQuery(getImpactTaleDto);

    // Adding received entity filters to query
    this.addEntityFiltersToQuery(impactDataQueryBuilder, getImpactTaleDto);

    // Adding received group by option to query

    this.addGroupAndOrderByToQuery(impactDataQueryBuilder, getImpactTaleDto);

    const dataForImpactTable: ImpactTableData[] =
      await impactDataQueryBuilder.getRawMany();

    if (!dataForImpactTable.length) {
      throw new NotFoundException(
        'Data required for building Impact Table could not been retrieved from DB',
      );
    }
    return dataForImpactTable;
  }

  async getDataForActualVsScenarioImpactTable(
    getActualVsScenarioImapctTable: GetActualVsScenarioImpactTabledto,
  ): Promise<ActualVsScenarioImpactTableData[]> {
    const impactDataQueryBuilder: SelectQueryBuilder<SourcingRecord> =
      this.createBasicSelectQuery(getActualVsScenarioImapctTable);

    impactDataQueryBuilder.leftJoin(
      ScenarioIntervention,
      'scenarioIntervention',
      'sourcingLocation.scenarioInterventionId = scenarioIntervention.id',
    );
    impactDataQueryBuilder.andWhere(
      new Brackets((qb: WhereExpressionBuilder) => {
        qb.where('scenarioIntervention.scenarioId = :scenarioId', {
          scenarioId: getActualVsScenarioImapctTable.scenarioId,
        }).orWhere('sourcingLocation.scenarioInterventionId is null');
      }),
    );

    this.addEntityFiltersToQuery(
      impactDataQueryBuilder,
      getActualVsScenarioImapctTable,
    );

    this.addGroupAndOrderByToQuery(
      impactDataQueryBuilder,
      getActualVsScenarioImapctTable,
    );

    const dataForActualVsScenarioImpactTable: ActualVsScenarioImpactTableData[] =
      await impactDataQueryBuilder.getRawMany();

    if (!dataForActualVsScenarioImpactTable.length) {
      throw new NotFoundException(
        'Data required for building Impact Table could not been retrieved from DB',
      );
    }
    return dataForActualVsScenarioImpactTable;
  }

  private createBasicSelectQuery(
    impactDataDto: GetActualVsScenarioImpactTabledto | GetImpactTableDto,
  ): SelectQueryBuilder<SourcingRecord> {
    const basicSelectQuery: SelectQueryBuilder<SourcingRecord> =
      this.createQueryBuilder('sourcingRecords')
        .select('sourcingRecords.year', 'year')
        .addSelect('sum(sourcingRecords.tonnage)', 'tonnes')
        .addSelect('sum(indicatorRecord.value)', 'impact')
        .addSelect('indicator.id', 'indicatorId')
        .addSelect('sourcingLocation.interventionType', 'typeByIntervention')
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

    return basicSelectQuery;
  }

  private addEntityFiltersToQuery(
    selectQueryBuilder: SelectQueryBuilder<SourcingRecord>,
    impactDataDto: GetActualVsScenarioImpactTabledto | GetImpactTableDto,
  ): SelectQueryBuilder<SourcingRecord> {
    if (impactDataDto.materialIds) {
      selectQueryBuilder.andWhere(
        'sourcingLocation.materialId IN (:...materialIds)',
        {
          materialIds: impactDataDto.materialIds,
        },
      );
    }

    if (impactDataDto.originIds) {
      selectQueryBuilder.andWhere(
        'sourcingLocation.adminRegionId IN (:...originIds)',
        {
          originIds: impactDataDto.originIds,
        },
      );
    }
    if (impactDataDto.supplierIds) {
      selectQueryBuilder.andWhere(
        new Brackets((qb: WhereExpressionBuilder) => {
          qb.where('sourcingLocation.t1SupplierId IN (:...supplierIds)', {
            supplierIds: impactDataDto.supplierIds,
          }).orWhere('sourcingLocation.producerId IN (:...supplierIds)', {
            supplierIds: impactDataDto.supplierIds,
          });
        }),
      );
    }

    if (impactDataDto.locationTypes) {
      selectQueryBuilder.andWhere(
        'sourcingLocation.locationType IN (:...locationTypes)',
        {
          locationTypes: impactDataDto.locationTypes,
        },
      );
    }

    return selectQueryBuilder;
  }

  private addGroupAndOrderByToQuery(
    selectQueryBuilder: SelectQueryBuilder<SourcingRecord>,
    impactDataDto: GetActualVsScenarioImpactTabledto | GetImpactTableDto,
  ): SelectQueryBuilder<SourcingRecord> {
    switch (impactDataDto.groupBy) {
      case GROUP_BY_VALUES.MATERIAL:
        selectQueryBuilder
          .addSelect('material.name', 'name')
          .groupBy('material.name');
        break;
      case GROUP_BY_VALUES.REGION:
        selectQueryBuilder
          .addSelect('adminRegion.name', 'name')
          .groupBy('adminRegion.name');
        break;
      case GROUP_BY_VALUES.SUPPLIER:
        selectQueryBuilder
          .addSelect('supplier.name', 'name')
          .andWhere('supplier.name IS NOT NULL')
          .groupBy('supplier.name');
        break;
      case GROUP_BY_VALUES.BUSINESS_UNIT:
        selectQueryBuilder
          .addSelect('businessUnit.name', 'name')
          .groupBy('businessUnit.name');
        break;
      case GROUP_BY_VALUES.LOCATION_TYPE:
        selectQueryBuilder
          .addSelect('sourcingLocation.locationType', 'name')
          .groupBy('sourcingLocation.locationType');
        break;
      default:
        selectQueryBuilder;
    }

    selectQueryBuilder
      .addGroupBy(
        `sourcingRecords.year, indicator.id, sourcingLocation.interventionType`,
      )
      .orderBy('year', 'ASC')
      .addOrderBy('name');

    return selectQueryBuilder;
  }
}

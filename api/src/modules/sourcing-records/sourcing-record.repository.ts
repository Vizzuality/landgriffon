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
  GetActualVsScenarioImpactTableDto,
  BaseImpactTableDto,
  GetImpactTableDto,
} from 'modules/impact/dto/impact-table.dto';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import { Indicator } from 'modules/indicators/indicator.entity';
import { Material } from 'modules/materials/material.entity';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { Logger, NotFoundException } from '@nestjs/common';
import { GROUP_BY_VALUES } from 'modules/h3-data/dto/get-impact-map.dto';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { ScenarioIntervention } from 'modules/scenario-interventions/scenario-intervention.entity';
import { GetScenarioComparisonDto } from 'modules/impact/dto/get-scenario-comparison.dto';

export class ImpactTableData {
  year: number;
  indicatorId: string;
  indicatorShortName: string;
  name: string;
  tonnes: string;
  impact: number;
  typeByIntervention: SOURCING_LOCATION_TYPE_BY_INTERVENTION | null;
}

export class ActualVsScenarioImpactTableData extends ImpactTableData {
  scenarioImpact?: number;
  absoluteDifference?: number;
  percentageDifference?: number;
}

export class ScenariosImpactTableData extends ImpactTableData {
  scenariosImpacts: ScenarioComparisonImpact[];
  scenariosTonnes: ScenarioComparisonTonnes[];
}

export class ScenarioComparisonImpact {
  scenarioId: string;
  impact: number;
}

export class ScenarioComparisonTonnes {
  scenarioId: string;
  tonnage: number;
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

  /**
   * @deprecated: Will be removed to impact repository
   */
  async getDataForImpactTable(
    getImpactTaleDto: GetImpactTableDto,
  ): Promise<ImpactTableData[]> {
    const impactDataQueryBuilder: SelectQueryBuilder<SourcingRecord> =
      this.createBasicSelectQuery(getImpactTaleDto);

    // Decide to select just actual data or scenario with actual data
    this.handleSourceDataSelect(impactDataQueryBuilder, getImpactTaleDto);

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
    getActualVsScenarioImpactTable: GetActualVsScenarioImpactTableDto,
  ): Promise<ActualVsScenarioImpactTableData[]> {
    const impactDataQueryBuilder: SelectQueryBuilder<SourcingRecord> =
      this.createBasicSelectQuery(getActualVsScenarioImpactTable);

    impactDataQueryBuilder.leftJoin(
      ScenarioIntervention,
      'scenarioIntervention',
      'sourcingLocation.scenarioInterventionId = scenarioIntervention.id',
    );
    impactDataQueryBuilder.andWhere(
      new Brackets((qb: WhereExpressionBuilder) => {
        qb.where('scenarioIntervention.scenarioId = :scenarioId', {
          scenarioId: getActualVsScenarioImpactTable.scenarioId,
        }).orWhere('sourcingLocation.scenarioInterventionId is null');
      }),
    );

    this.addEntityFiltersToQuery(
      impactDataQueryBuilder,
      getActualVsScenarioImpactTable,
    );

    this.addGroupAndOrderByToQuery(
      impactDataQueryBuilder,
      getActualVsScenarioImpactTable,
    );
    impactDataQueryBuilder.addGroupBy('scenario.id');

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
    impactDataDto: GetActualVsScenarioImpactTableDto | BaseImpactTableDto,
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
    impactDataDto: GetActualVsScenarioImpactTableDto | GetImpactTableDto,
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
    impactDataDto: GetActualVsScenarioImpactTableDto | BaseImpactTableDto,
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

  /**
   * @description: Conditionally decide to add Scenario AND Actual Data,
   *               or just Actual data
   */

  private handleSourceDataSelect(
    queryBuilder: SelectQueryBuilder<SourcingRecord>,
    dto: GetImpactTableDto,
  ): SelectQueryBuilder<SourcingRecord> {
    if (dto.scenarioId) {
      queryBuilder
        .leftJoin(
          ScenarioIntervention,
          'scenarioIntervention',
          'sourcingLocation.scenarioInterventionId = scenarioIntervention.id',
        )
        .andWhere(
          new Brackets((qb: WhereExpressionBuilder) => {
            qb.where('scenarioIntervention.scenarioId = :scenarioId', {
              scenarioId: dto.scenarioId,
            }).orWhere('sourcingLocation.scenarioInterventionId is null');
          }),
        );
    } else {
      queryBuilder.andWhere('sourcingLocation.scenarioInterventionId is null');
      queryBuilder.andWhere('sourcingLocation.interventionType is null');
    }

    return queryBuilder;
  }
}

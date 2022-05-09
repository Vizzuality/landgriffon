import {
  Brackets,
  EntityRepository,
  Repository,
  SelectQueryBuilder,
  WhereExpressionBuilder,
} from 'typeorm';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import {
  LOCATION_TYPES_PARAMS,
  SourcingLocation,
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

export class ImpactTableData {
  year: number;
  indicatorId: string;
  indicatorShortName: string;
  name: string;
  tonnes: string;
  impact: number;
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
      locationType,
    } = getImpactTaleDto;
    const impactDataQueryBuilder: SelectQueryBuilder<SourcingRecord> =
      this.createQueryBuilder('sourcingRecords')
        .select('sourcingRecords.year', 'year')
        .addSelect('sum(sourcingRecords.tonnage)', 'tonnes')
        .addSelect('sum(indicatorRecord.value)', 'impact')
        .addSelect('indicator.id', 'indicatorId')
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
      impactDataQueryBuilder;
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

    if (locationType) {
      const sourcingLocationTypes: string[] = locationType.map(
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

  /**
   * @description Retrieves data to calculate Indicator Records for all Sourcing Records present in the DB
   * Uses stored functions created with migration: 1645259040554-ImpactStoredFunctions.ts
   */
  async getIndicatorRawDataForAllSourcingRecords(): Promise<
    SourcingRecordsWithIndicatorRawDataDto[]
  > {
    try {
      const response: any = await this.query(`
      SELECT
          sr.id as "sourcingRecordId",
          sr.tonnage,
          sr.year,
          sl.id as "sourcingLocationId",
          sl.production,
          sl."harvestedArea",
          sl."rawDeforestation",
          sl."rawBiodiversity",
          sl."rawCarbon",
          sl."rawWater"
      FROM
          sourcing_records sr
          INNER JOIN
              (
                  SELECT
                      id,
                      sum_material_over_georegion("geoRegionId", "materialId", 'producer') as production,
                      sum_material_over_georegion("geoRegionId", "materialId", 'harvest') as "harvestedArea",
                      sum_weighted_deforestation_over_georegion("geoRegionId", "materialId", 'harvest') as "rawDeforestation",
                      sum_weighted_biodiversity_over_georegion("geoRegionId", "materialId", 'harvest') as "rawBiodiversity",
                      sum_weighted_carbon_over_georegion("geoRegionId", "materialId", 'harvest') as "rawCarbon",
                      sum_weighted_water_over_georegion("geoRegionId") as "rawWater",
                      "scenarioInterventionId",
                      "interventionType"
                  FROM
                      sourcing_location
                  WHERE "scenarioInterventionId" IS NULL
                  AND "interventionType" IS NULL
              ) as sl
              on sr."sourcingLocationId" = sl.id`);
      if (!response.length)
        this.logger.warn(
          `Could not retrieve Sourcing Records with weighted indicator values`,
        );

      return response;
    } catch (err: any) {
      this.logger.error(
        `Error querying data from DB to calculate Indicator Records: ${err.message}`,
      );
      throw new MissingH3DataError(
        `Could net retrieve Indicator Raw data from Sourcing Locations: ${err}`,
      );
    }
  }
}

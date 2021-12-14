import { EntityRepository, Repository, SelectQueryBuilder } from 'typeorm';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { GetImpactTableDto } from 'modules/impact/dto/get-impact-table.dto';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import { Indicator } from 'modules/indicators/indicator.entity';
import { Material } from 'modules/materials/material.entity';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { NotFoundException } from '@nestjs/common';
import { GROUP_BY_VALUES } from 'modules/h3-data/dto/get-impact-map.dto';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';

export class ImpactTableData {
  year: string;
  indicatorId: string;
  indicatorShortName: string;
  name: string;
  tonnes: string;
  impact: number;
}

@EntityRepository(SourcingRecord)
export class SourcingRecordRepository extends Repository<SourcingRecord> {
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
      impactDataQueryBuilder
        .andWhere('sourcingLocation.producerId IN (:...supplierIds)', {
          supplierIds,
        })
        .orWhere('sourcingLocation.t1SupplierId IN (:...supplierIds)', {
          supplierIds,
        });
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
          .groupBy('supplier.name');
        break;
      case GROUP_BY_VALUES.BUSINESS_UNIT:
        impactDataQueryBuilder
          .addSelect('businessUnit.name', 'name')
          .groupBy('businessUnit.name');
        break;
      default:
    }
    impactDataQueryBuilder
      .addGroupBy(`sourcingRecords.year, sourcingRecords.id, indicator.id`)
      .orderBy('year', 'ASC');
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

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { H3DataRepository } from 'modules/h3-data/h3-data.repository';
import { SourcingRecordRepository } from 'modules/sourcing-records/sourcing-record.repository';
import { GetImpactTableDto } from 'modules/h3-data/dto/get-impact-table.dto';
import { SelectQueryBuilder } from 'typeorm';

@Injectable()
export class ImpactTableService {
  constructor(
    @InjectRepository(H3DataRepository)
    protected readonly h3DataRepository: H3DataRepository,
  ) {}

  async getImpactTable(getImpactTableDto: GetImpactTableDto): Promise<any> {
    const queryBuilder: SelectQueryBuilder<SourcingRecordRepository> = await this.h3DataRepository
      .createQueryBuilder()
      .select('year')
      .addSelect('sum(ir.value)')
      .addSelect('ir."indicatorId"')
      .addSelect('ir."shortName"')
      .from(SourcingRecordRepository, 'sr')
      .leftJoin('indicator_record', 'ir', 'ir."sourcingRecordId" = sr.id')
      .leftJoin('sourcing_location', 'sr', 'sl.id = sr."sourcingLocationId"')
      .leftJoin('indicator', 'i', 'i.id = ir."indicatorId"')
      .where('sr.year = :year', { year: getImpactTableDto.startYear });
    if (getImpactTableDto.materialIds?.length) {
      queryBuilder.andWhere('sl.material IN (:...materialIds)', {
        materialIds: getImpactTableDto.materialIds,
      });
    }
    if (getImpactTableDto.indicatorIds?.length) {
      queryBuilder.andWhere('sl.indicator IN (:...indicatorIds)', {
        materialIds: getImpactTableDto.indicatorIds,
      });
    }
    if (getImpactTableDto.originIds?.length) {
      queryBuilder.andWhere('sl."adminRegion" IN (:...originIds)', {
        originIds: getImpactTableDto.originIds,
      });
    }
    if (getImpactTableDto.supplierIds?.length) {
      queryBuilder.andWhere('sl."t1Supplier" IN (:...supplierIds)', {
        supplierIds: getImpactTableDto.supplierIds,
      });
    }
    queryBuilder.groupBy(getImpactTableDto.groupBy);
    const response: any = await queryBuilder.getMany();
    console.log('responseeee', response);
    return response;
  }
}

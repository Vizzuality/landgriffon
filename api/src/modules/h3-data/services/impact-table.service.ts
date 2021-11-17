import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { H3DataRepository } from 'modules/h3-data/h3-data.repository';
import { GetImpactTableDto } from 'modules/h3-data/dto/get-impact-table.dto';
import { getManager, SelectQueryBuilder } from 'typeorm';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';

@Injectable()
export class ImpactTableService {
  logger: Logger = new Logger(ImpactTableService.name);
  constructor(
    @InjectRepository(H3DataRepository)
    protected readonly h3DataRepository: H3DataRepository,
  ) {}

  async getImpactTable(getImpactTableDto: GetImpactTableDto): Promise<any> {
    const queryBuilder: SelectQueryBuilder<SourcingRecord> = await getManager()
      .createQueryBuilder()
      .select('year')
      .addSelect('sum(ir.value)', 'value')
      .addSelect('ir."indicatorId"')
      .addSelect('i."shortName"')
      .from(SourcingRecord, 'sr')
      .leftJoin('indicator_record', 'ir', 'ir."sourcingRecordId" = sr.id')
      .leftJoin('sourcing_location', 'sl', 'sl.id = sr."sourcingLocationId"')
      .leftJoin('indicator', 'i', 'i.id = ir."indicatorId"')
      .where('sr.year >= :year', { year: getImpactTableDto.startYear });
    if (getImpactTableDto.materialIds?.length) {
      queryBuilder.andWhere('sl.material IN (:...materialIds)', {
        materialIds: getImpactTableDto.materialIds,
      });
    }
    if (getImpactTableDto.indicatorIds?.length) {
      queryBuilder.andWhere('ir."indicatorId" IN (:...indicatorIds)', {
        indicatorIds: getImpactTableDto.indicatorIds,
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
    queryBuilder.groupBy(`sr.year, ir."indicatorId", i."shortName"`);
    const response: any = await queryBuilder.getRawMany();

    this.logger.log('Impact table generated');
    return response;
  }

  private cleanImpactTable(impactTable: any): any {}
}

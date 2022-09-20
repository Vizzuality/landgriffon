import {
  Column,
  Entity,
  getManager,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Indicator } from 'modules/indicators/indicator.entity';
import { BaseServiceResource } from 'types/resource.interface';
import { ApiProperty } from '@nestjs/swagger';
import { TimestampedBaseEntity } from 'baseEntities/timestamped-base-entity';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { IndicatorCoefficient } from 'modules/indicator-coefficients/indicator-coefficient.entity';
import { H3Data } from 'modules/h3-data/h3-data.entity';
import { IMPACT_VIEW_NAME } from 'modules/impact/views/impact.materialized-view.entity';

export const indicatorRecordResource: BaseServiceResource = {
  className: 'IndicatorRecord',
  name: {
    singular: 'indicatorRecord',
    plural: 'indicatorRecords',
  },
  entitiesAllowedAsIncludes: ['indicatorRecords'],
  columnsAllowedAsFilter: [
    'value',
    'status',
    'sourcingRecordId',
    'indicatorId',
  ],
};
export enum INDICATOR_RECORD_STATUS {
  UNSTARTED = 'unstarted',
  STARTED = 'started',
  SUCCESS = 'success',
  FAILURE = 'failure',
}

@Entity()
export class IndicatorRecord extends TimestampedBaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'float', nullable: true })
  value!: number;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: INDICATOR_RECORD_STATUS,
    default: INDICATOR_RECORD_STATUS.UNSTARTED,
  })
  status!: INDICATOR_RECORD_STATUS;

  @ApiProperty()
  @Column({ nullable: true })
  statusMsg?: string;

  @UpdateDateColumn({
    type: 'timestamptz',
  })
  statusTimestamp!: string;

  @ManyToOne(
    () => SourcingRecord,
    (sourcingRecord: SourcingRecord) => sourcingRecord.id,
    { eager: false, onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'sourcingRecordId' })
  sourcingRecord: SourcingRecord;

  @Index()
  @Column()
  sourcingRecordId: string;

  @ManyToOne(() => Indicator, (indicator: Indicator) => indicator.id, {
    eager: false,
  })
  @JoinColumn({ name: 'indicatorId' })
  indicator!: Indicator;
  @Column({ nullable: true })
  indicatorId: string;

  @ManyToOne(
    () => IndicatorCoefficient,
    (indicatorCoefficient: IndicatorCoefficient) => indicatorCoefficient.id,
    {
      eager: false,
    },
  )
  @JoinColumn({ name: 'indicatorCoefficientId' })
  indicatorCoefficientId!: IndicatorCoefficient;

  // Scaler: Production total sum.
  @Column({ type: 'float', nullable: true })
  scaler: number;

  @ManyToOne(() => H3Data, (h3Data: H3Data) => h3Data.indicatorRecords)
  @JoinColumn({ name: 'materialH3DataId' })
  materialH3Data: H3Data;

  @Column({ nullable: false })
  materialH3DataId: string;

  //@AfterInsert()
  static async updateImpactView(): Promise<void> {
    await getManager().query(
      `REFRESH MATERIALIZED VIEW ${IMPACT_VIEW_NAME} WITH DATA`,
    );
  }
}

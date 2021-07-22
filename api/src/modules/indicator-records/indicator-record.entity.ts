import {
  Column,
  Entity,
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
  id!: string;

  @ApiProperty()
  @Column({ type: 'int', nullable: true })
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
    { eager: false },
  )
  @JoinColumn({ name: 'sourcingRecordId' })
  sourcingRecordId: SourcingRecord;

  @ManyToOne(() => Indicator, (indicator: Indicator) => indicator.id, {
    eager: false,
  })
  @JoinColumn({ name: 'indicatorId' })
  indicatorId!: Indicator;

  @ManyToOne(
    () => IndicatorCoefficient,
    (indicatorCoefficient: IndicatorCoefficient) => indicatorCoefficient.id,
    {
      eager: false,
    },
  )
  @JoinColumn({ name: 'indicatorCoefficientId' })
  indicatorCoefficientId!: IndicatorCoefficient;
}

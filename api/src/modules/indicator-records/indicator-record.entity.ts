import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Indicator } from 'modules/indicators/indicator.entity';
import { BaseServiceResource } from 'types/resource.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
export enum TASK_STATUS {
  UNSTARTED = 'Unstarted',
  STARTED = 'started',
  SUCCESS = 'success',
  FAILURE = 'failure',
}

@Entity()
export class IndicatorRecord extends TimestampedBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id!: string;

  @Column({ type: 'int', nullable: true })
  @ApiPropertyOptional()
  value?: number;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: TASK_STATUS,
    default: TASK_STATUS.UNSTARTED,
  })
  status!: TASK_STATUS;

  @ApiProperty()
  @Column({ nullable: true })
  statusMsg: string;

  @UpdateDateColumn({
    type: 'timestamptz',
  })
  statusTimestamp!: string;

  @ManyToOne(
    () => SourcingRecord,
    (sourcingRecord: SourcingRecord) => sourcingRecord.id,
    { eager: false },
  )
  sourcingRecord: SourcingRecord;

  @ManyToOne(() => Indicator, (indicator: Indicator) => indicator.id, {
    eager: false,
  })
  indicator!: Indicator;

  @ManyToOne(
    () => IndicatorCoefficient,
    (indicatorCoefficient: IndicatorCoefficient) => indicatorCoefficient.id,
    {
      eager: false,
    },
  )
  indicatorCoefficient!: IndicatorCoefficient;
}

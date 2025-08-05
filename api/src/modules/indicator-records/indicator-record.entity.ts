import {
  BaseEntity,
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Indicator } from 'modules/indicators/indicator.entity';
import { BaseServiceResource } from 'types/resource.interface';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { H3Data } from 'modules/h3-data/h3-data.entity';

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
@Check(`value <> 'NaN'`)
@Check(`scaler <> 'NaN'`)
export class IndicatorRecord extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'float', nullable: true })
  value!: number;

  @Column({
    type: 'enum',
    enum: INDICATOR_RECORD_STATUS,
    default: INDICATOR_RECORD_STATUS.UNSTARTED,
  })
  status!: INDICATOR_RECORD_STATUS;

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

  // Scaler: Production total sum.
  @Column({ type: 'float', nullable: true })
  scaler: number | null;

  @ManyToOne(() => H3Data, (h3Data: H3Data) => h3Data.indicatorRecords)
  @JoinColumn({ name: 'materialH3DataId' })
  materialH3Data: H3Data;

  @Column({ nullable: false })
  materialH3DataId: string;
}

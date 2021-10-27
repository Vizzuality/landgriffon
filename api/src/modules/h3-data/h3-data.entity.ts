import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Indicator } from 'modules/indicators/indicator.entity';

/**
 * @note: Interface props are marked as 'h' and 'v' because that is what the DB returns when querying a h3 maps
 * So we avoid doing transformations within the API and let the DB handle the heavy job. This also minimizes the
 * response size sent to the frontend
 */

export interface H3IndexValueData {
  // H3 index
  h: string;
  // Values for an h3 index
  v: number;
}

export enum H3_DATA_TYPES {
  HARVEST = 'harvest_area',
  PRODUCTION = 'production',
  YIELD = 'yield',
  INDICATOR = 'indicator',
}

export enum LAYER_TYPES {
  RISK = 'risk',
  IMPACT = 'impact',
  MATERIAL = 'material',
}

@Entity('h3_data')
@Index(['h3tableName', 'h3columnName'], { unique: true })
export class H3Data extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  h3tableName!: string;

  @Column({ type: 'varchar' })
  h3columnName!: string;

  @Column({ type: 'int' })
  year!: number;

  @Column({ type: 'int' })
  h3resolution: number;

  @ManyToOne(() => Indicator, (indicator: Indicator) => indicator.id)
  @JoinColumn({ name: 'indicatorId' })
  indicators: Indicator[];

  @Column({ nullable: true })
  indicatorId: string;

  @Column({
    type: 'enum',
    enum: H3_DATA_TYPES,
    nullable: true,
  })
  dataType: H3_DATA_TYPES;

  @Column({ type: 'json', nullable: true })
  metadata?: JSON;
}

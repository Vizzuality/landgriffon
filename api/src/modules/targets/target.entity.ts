import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TimestampedBaseEntity } from 'baseEntities/timestamped-base-entity';
import { BaseServiceResource } from 'types/resource.interface';
import { Indicator } from 'modules/indicators/indicator.entity';
import { User } from 'modules/users/user.entity';

export const targetResource: BaseServiceResource = {
  className: 'Target',
  name: {
    singular: 'target',
    plural: 'targets',
  },
  entitiesAllowedAsIncludes: [],
  columnsAllowedAsFilter: [],
};

@Entity()
export class Target extends TimestampedBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'int' })
  baseLineYear!: number;

  @Column({ type: 'int' })
  targetYear!: number;

  @Column({ type: 'float' })
  value!: number;

  @ManyToOne(() => Indicator, (indicator: Indicator) => indicator.id, {
    eager: false,
  })
  @JoinColumn({ name: 'indicatorId' })
  indicator!: Indicator;
  @Column()
  indicatorId!: string;

  @ManyToOne(() => User, (user: User) => user.id)
  @Column({ nullable: true })
  lastEditedUserId?: string;
}

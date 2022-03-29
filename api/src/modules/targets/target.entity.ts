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
import { ApiProperty } from '@nestjs/swagger';

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
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty()
  @Column({ type: 'int' })
  baseLineYear!: number;

  @ApiProperty()
  @Column({ type: 'int' })
  targetYear!: number;

  @ApiProperty()
  @Column({ type: 'float' })
  value!: number;

  @ManyToOne(() => Indicator, (indicator: Indicator) => indicator.id, {
    eager: false,
  })
  @JoinColumn({ name: 'indicatorId' })
  indicator!: Indicator;
  @ApiProperty()
  @Column()
  indicatorId!: string;

  @ManyToOne(() => User, (user: User) => user.id)
  @ApiProperty()
  @Column({ nullable: true })
  updatedById?: string;
}

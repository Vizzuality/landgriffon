import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseServiceResource } from 'types/resource.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IndicatorCoefficient } from 'modules/indicator-coefficients/indicator-coefficient.entity';

export const indicatorSourceResource: BaseServiceResource = {
  className: 'IndicatorSource',
  name: {
    singular: 'indicatorSource',
    plural: 'indicatorSources',
  },
  entitiesAllowedAsIncludes: [],
  columnsAllowedAsFilter: ['title', 'description'],
};

@Entity()
export class IndicatorSource extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  @ApiProperty()
  title!: string;

  @Column({ type: 'text', nullable: true })
  shortName!: string;

  @Column({ type: 'text', nullable: true, unique: true })
  nameCode?: string;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional()
  description?: string;

  @Column({ type: 'jsonb', nullable: true })
  @ApiPropertyOptional()
  metadata?: JSON;

  @OneToMany(
    () => IndicatorCoefficient,
    (indicatorCoefficient: IndicatorCoefficient) =>
      indicatorCoefficient.indicatorSource,
  )
  indicatorCoefficients?: IndicatorCoefficient[];
}

import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseServiceResource } from 'types/resource.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Layer } from 'modules/layers/layer.entity';
import { IndicatorCoefficient } from '../indicator-coefficients/indicator-coefficient.entity';

export const indicatorSourceResource: BaseServiceResource = {
  className: 'IndicatorSource',
  name: {
    singular: 'indicatorSource',
    plural: 'indicatorSources',
  },
  entitiesAllowedAsIncludes: [],
};

@Entity()
export class IndicatorSource extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @ApiProperty()
  title!: string;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional()
  description?: string;

  @Column({ type: 'jsonb', nullable: true })
  @ApiPropertyOptional()
  metadata?: JSON;

  @ManyToOne(() => Layer, (layer: Layer) => layer.indicatorSources, {
    eager: false,
  })
  layer!: Layer;

  @Column()
  @ApiProperty()
  layerId!: string;

  @OneToMany(
    () => IndicatorCoefficient,
    (indicatorCoefficient: IndicatorCoefficient) =>
      indicatorCoefficient.indicatorSource,
  )
  indicatorCoefficients?: IndicatorCoefficient[];
}

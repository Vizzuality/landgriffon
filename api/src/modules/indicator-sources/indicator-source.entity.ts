import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseServiceResource } from 'types/resource.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Layer } from 'modules/layers/layer.entity';
import { IndicatorCoefficient } from 'modules/indicator-coefficients/indicator-coefficient.entity';

export const indicatorSourceResource: BaseServiceResource = {
  className: 'IndicatorSource',
  name: {
    singular: 'indicatorSource',
    plural: 'indicatorSources',
  },
  entitiesAllowedAsIncludes: [],
  columnsAllowedAsFilter: ['title', 'description', 'layerId'],
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

  @ManyToOne(() => Layer, (layer: Layer) => layer.indicatorSources, {
    eager: false,
  })
  @JoinColumn()
  layer!: Layer;

  @OneToMany(
    () => IndicatorCoefficient,
    (indicatorCoefficient: IndicatorCoefficient) =>
      indicatorCoefficient.indicatorSource,
  )
  indicatorCoefficients?: IndicatorCoefficient[];
}

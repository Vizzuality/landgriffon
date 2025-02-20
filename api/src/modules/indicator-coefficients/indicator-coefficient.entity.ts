import {
  BaseEntity,
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Indicator } from 'modules/indicators/indicator.entity';
import { Material } from 'modules/materials/material.entity';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { BaseServiceResource } from 'types/resource.interface';

export const indicatorCoefficientResource: BaseServiceResource = {
  className: 'IndicatorCoefficient',
  name: {
    singular: 'indicatorCoefficient',
    plural: 'indicatorCoefficients',
  },
  entitiesAllowedAsIncludes: ['indicators'],
  columnsAllowedAsFilter: ['value', 'year', 'indicatorSourceId'],
};

// TODO: Check with data or uniqueness combinations here
// TODO: Bring up with the team if time to switch snake_case has come, also to rename entities: indicator coefficient to impact factor

// TODO: There are LOTS of rows where material is null, does that make sense? After checking the code, the only layer accesing this table\
//       seem to be the stored procedure

// SELECT
// "materialId",
//   "indicatorId",
//   "adminRegionId",
// COUNT(*) AS duplicados
// FROM indicator_coefficient
// GROUP BY "materialId", "indicatorId", "adminRegionId"
// HAVING COUNT(*) > 1;

// TODO: The only query that uses this table also filters by the value not being null, regardless of the admin region being null or not, so we
//       could also include it in a potential composite index, as this procedure is executed for each year for each location, and it can have more than
//       700k rows.

// TODO: We also have NULL values, that apparently are always ignored in the queries. Does it make any sense to allow values to be null? should we remove
//       them all?

@Entity()
export class IndicatorCoefficient extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'float', nullable: true })
  value?: number;

  @Index()
  @Column({ type: 'int' })
  year!: number;

  @Index()
  @ManyToOne(() => AdminRegion, (ar: AdminRegion) => ar.indicatorCoefficients, {
    nullable: true,
  })
  adminRegion: AdminRegion;

  @Index()
  @ManyToOne(
    () => Indicator,
    (indicator: Indicator) => indicator.indicatorCoefficients,
  )
  indicator!: Indicator;

  @Index()
  @ManyToOne(() => Material, (mat: Material) => mat.indicatorCoefficients)
  material!: Material;
}

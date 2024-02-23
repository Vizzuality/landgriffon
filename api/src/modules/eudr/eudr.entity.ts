import { GeoRegion } from 'modules/geo-regions/geo-region.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import {
  BaseEntity,
  Column,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

// Base initial entity for EUDR, we might end up storing this data in our side or not
// The initial implementation will build the DTO on the fly and return it to the client
// But we will keep this for reference and future storage in our side

export class EUDR extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // The CSV references a PLOT_ID, but this could effectively be a geoRegionId?
  // create a one to one realtion with GeoRegion
  @OneToOne(() => GeoRegion)
  @JoinColumn({ name: 'geoRegionId' })
  geoRegion: GeoRegion;
  @Column()
  geoRegionId: string;

  // Create a Many to one realtion with Suppliers
  @ManyToOne(() => Supplier, (supplier: Supplier) => supplier.id)
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @Column()
  supplierId: string;

  // This might correspond / be related to the sourcing year (sourcing record entity) by one to one relation
  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'boolean', default: false })
  hasEUDRAlerts: boolean;

  @Column({ type: 'int' })
  alertsNumber: number;

  // TODO: Clarify if a relation with material is necessary
}

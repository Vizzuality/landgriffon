import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('unit-conversions')
export class UnitConversion extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', nullable: true })
  unit1?: number;

  @Column({ type: 'int', nullable: true })
  unit2?: number;

  @Column({ type: 'float', nullable: true })
  factor?: number;

  /**
   * @note: 'unit_2 = unit_1 * factor'] // 1000
   */
}

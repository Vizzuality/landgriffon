import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('units')
export class Unit extends BaseEntity {
  /**
   * @debt: Add relation to indicators
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'character varying', nullable: false, unique: true })
  name!: string;

  @Column({ type: 'character varying', nullable: true })
  symbol?: string;

  @Column({ type: 'float', nullable: true })
  float?: number;
}

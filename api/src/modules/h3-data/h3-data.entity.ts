import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('h3_data')
export class H3Data extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  h3tableName!: string;

  @Column({ type: 'jsonb' })
  h3columnNames!: JSON;
}

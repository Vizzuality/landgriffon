import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('h3_data')
@Index(['h3tableName', 'h3columnName'], { unique: true })
export class H3Data extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  h3tableName!: string;

  @Column({ type: 'varchar' })
  h3columnName!: string;

  @Column({ type: 'int' })
  h3resolution: number
}

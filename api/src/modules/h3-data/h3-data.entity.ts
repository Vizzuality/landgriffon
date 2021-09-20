import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export interface H3IndexValueData {
  //H3 index
  h: string;
  // Values for an h3 index
  v: number;
}

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
  h3resolution: number;
}

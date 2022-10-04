import { Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

/**
 * This enum is used to validate role names; it needs to be updated if new
 * roles are added to the database.
 */

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id!: string;

  @PrimaryColumn({ type: 'varchar' })
  name!: string;
}

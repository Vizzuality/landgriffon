import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseServiceResource } from 'types/resource.interface';
import { IndicatorCoefficient } from 'modules/indicator-coefficients/indicator-coefficient.entity';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { SourcingRecordGroup } from '../sourcing-record-groups/sourcing-record-group.entity';

export const userResource: BaseServiceResource = {
  className: 'User',
  name: {
    singular: 'user',
    plural: 'users',
  },
  entitiesAllowedAsIncludes: ['projects'],
};

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty()
  @Column('character varying', {
    unique: true,
  })
  email!: string;

  @ApiPropertyOptional()
  @Column('character varying', { name: 'display_name', nullable: true })
  displayName?: string | null;

  @ApiPropertyOptional()
  @Column('character varying', {
    nullable: true,
  })
  fname?: string | null;

  @ApiPropertyOptional()
  @Column('character varying', {
    nullable: true,
  })
  lname?: string | null;

  /**
   * User avatar, stored as data url.
   *
   * For example: `data:image/gif;base64,<base64-encoded image binary data>
   */
  @ApiPropertyOptional()
  @Column('character varying', { name: 'avatar_data_url', nullable: true })
  avatarDataUrl?: string;

  @Column('character varying', { name: 'password' })
  password!: string;

  @Column('character varying', { name: 'salt' })
  salt!: string;

  /**
   * Whether this user is active (email is confirmed).
   */
  @ApiProperty()
  @Column('boolean', { name: 'is_active', default: false })
  isActive!: boolean;

  /**
   * Whether the user should be considered as deleted. This is used to implement
   * a grace period before full deletion.
   */
  @ApiProperty()
  @Column('boolean', { name: 'is_deleted', default: false })
  isDeleted!: boolean;

  @OneToMany(() => IndicatorCoefficient, (ic: IndicatorCoefficient) => ic.user)
  indicatorCoefficients: IndicatorCoefficient[];

  @OneToMany(
    () => SourcingLocation,
    (sc: SourcingLocation) => sc.lastEditedUser,
  )
  sourcingLocations: SourcingLocation[];

  @OneToMany(
    () => SourcingRecordGroup,
    (srg: SourcingRecordGroup) => srg.lastEditedUser,
  )
  sourcingRecordGroups: SourcingRecordGroup[];
}

export class JSONAPIUserData {
  @ApiProperty()
  type: string = userResource.name.plural;

  @ApiProperty()
  id!: string;

  @ApiProperty()
  attributes!: User;
}

export class UserResult {
  @ApiProperty()
  data!: JSONAPIUserData;
}

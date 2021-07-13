import { ApiProperty } from '@nestjs/swagger';

import { IsEnum } from 'class-validator';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { BaseServiceResource } from 'types/resource.interface';

export const apiEventResource: BaseServiceResource = {
  className: 'ApiEvent',
  name: {
    singular: 'api_event',
    plural: 'api_events',
  },
  columnsAllowedAsFilter: [],
};

/**
 * Available kinds of API Events. See the Event.kind prop documentation below
 * for more information.
 */
export enum API_EVENT_KINDS {
  user__signedUp__v1alpha1 = 'user.signedUp/v1alpha1',
  user__accountActivationTokenGenerated__v1alpha1 = 'user.accountActivationTokenGenerated/v1alpha1',
  user__accountActivationSucceeded__v1alpha1 = 'user.accountActivationSucceeded/v1alpha1',
  user__accountActivationFailed__v1alpha1 = 'user.accountActivationFailed/v1alpha1',
  user__passwordResetTokenGenerated__v1alpha1 = 'user.passwordResetTokenGenerated/v1alpha1',
  user__passwordResetSucceeded__v1alpha1 = 'user.passwordResetSucceeded/v1alpha1',
  user__passwordResetFailed__v1alpha1 = 'user.passwordResetFailed/v1alpha1',
}

/**
 * An event topic qualified by kind.
 */
export interface QualifiedEventTopic {
  topic: string;
  kind: API_EVENT_KINDS;
}

/**
 * An Event used to exchange information between components of the API.
 */
@Entity('api_events')
@Index(['topic', 'timestamp'])
export class ApiEvent {
  /**
   * Unique identifier of an event. Usually generated automatically and normally
   * not used anywhere.
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * Timestamp of the event.
   */
  @Column('timestamp', {
    default: () => 'now()',
  })
  timestamp!: Date;

  /**
   * Each event topic (for example, the UUID of an entity) may be used across
   * distinct event kinds. For example, events emitted during creation and
   * validation of a new user account will all use the user's UUID as topic and,
   * as kind, `API_EVENT_KINDS.UserSignedUp` when the account is created,
   * `API_EVENT_KINDS.UserAccountActivationTokenGenerated` when a one-time
   * activation token is generated, and then
   * `API_EVENT_KINDS.UserAccountActivationSucceeded` or
   * `API_EVENT_KINDS.UserAccountActivationSucceeded` when the validation
   * succeeds or fails, respectively (the latter could happen if the user tries
   * to validate an expired token).
   */
  @ApiProperty()
  @IsEnum(Object.values(API_EVENT_KINDS))
  @Column('enum', { enum: Object.values(API_EVENT_KINDS) })
  @Index()
  kind!: string;

  /**
   * Topic of an event; this will typically be the UUID of an entity in the
   * system about which events are emitted.
   */
  @ApiProperty()
  @Column('uuid')
  @Index()
  topic!: string;

  /**
   * Data payload of the event. Its semantics depend on kind.
   *
   * @debt Right now, we don't use formal schemas: emitters and consumers of
   * events are responsible for the appropriate handling of shared semantics.
   */
  @Column('jsonb', { default: '{}' })
  data!: Record<string, unknown>;
}

export class JSONAPIApiEventData {
  @ApiProperty()
  type: string = 'countries';

  @ApiProperty()
  id!: string;

  @ApiProperty()
  attributes!: ApiEvent;
}

export class ApiEventResult {
  @ApiProperty()
  data!: JSONAPIApiEventData;
}

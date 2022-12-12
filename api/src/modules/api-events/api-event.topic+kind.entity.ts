import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsEnum } from 'class-validator';
import { Column, PrimaryColumn, ViewEntity } from 'typeorm';

import { API_EVENT_KINDS } from 'modules/api-events/api-event.entity';

export class ApiEventByTopicAndKind {
  @Column('timestamp without time zone', {
    default: () => 'now()',
  })
  timestamp!: Date;

  @ApiProperty()
  @IsEnum(API_EVENT_KINDS)
  @PrimaryColumn('enum', { enum: Object.values(API_EVENT_KINDS) })
  kind!: API_EVENT_KINDS;

  @ApiProperty()
  @PrimaryColumn('uuid')
  topic!: string;

  @ApiPropertyOptional()
  @Column('jsonb')
  data?: Record<string, unknown>;
}

@ViewEntity({
  name: 'latest_api_event_by_topic_and_kind',
  expression: `SELECT DISTINCT
               ON (topic, kind)
                 topic, timestamp, kind, data
               FROM api_events
               ORDER BY topic, kind, timestamp DESC;`,
})
export class LatestApiEventByTopicAndKind extends ApiEventByTopicAndKind {}

@ViewEntity({
  name: 'first_api_event_by_topic_and_kind',
  expression: `SELECT DISTINCT
               ON (topic, kind)
                 topic, timestamp, kind, data
               FROM api_events
               ORDER BY topic, kind, timestamp ASC;`,
})
export class FirstApiEventByTopicAndKind extends ApiEventByTopicAndKind {}

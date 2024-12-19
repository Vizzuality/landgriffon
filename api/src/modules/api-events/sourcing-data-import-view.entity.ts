import { ViewEntity } from 'typeorm';
import { ApiEventByTopicAndKind } from './api-event.topic+kind.entity';

@ViewEntity({
  name: 'sourcing_data_import_view',
  expression: `SELECT topic, timestamp, kind, data
               FROM api_events
               WHERE kind::TEXT LIKE '%sourcing-data%'
               ORDER BY topic, kind, timestamp DESC;`,
})
export class SourcingDataImportViewEntity extends ApiEventByTopicAndKind {}

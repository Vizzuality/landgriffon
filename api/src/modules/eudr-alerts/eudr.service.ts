import { Injectable } from '@nestjs/common';
import { AlertsRepository } from './alerts.repository';

import { ResourceStream } from '@google-cloud/paginator';
import { RowMetadata } from '@google-cloud/bigquery/build/src/table';

@Injectable()
export class EudrService {
  constructor(private readonly alertsRepository: AlertsRepository) {}

  getAlerts(): ResourceStream<RowMetadata> {
    return this.alertsRepository.select();
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { ResourceStream } from '@google-cloud/paginator';
import { RowMetadata } from '@google-cloud/bigquery/build/src/table';
import { AlertsRepository } from './alerts.repository';

@Injectable()
export class EudrService {
  constructor(private readonly alertsRepository: AlertsRepository) {}

  getAlerts(): ResourceStream<RowMetadata> {
    return this.alertsRepository.select();
  }
}

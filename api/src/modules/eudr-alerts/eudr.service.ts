import { Inject, Injectable } from '@nestjs/common';
import { GetEUDRAlertsDto } from 'modules/eudr-alerts/dto/get-alerts.dto';
import { AlertsOutput } from 'modules/eudr-alerts/dto/alerts-output.dto';
import {
  EUDRAlertDates,
  IEUDRAlertsRepository,
} from 'modules/eudr-alerts/eudr.repositoty.interface';

@Injectable()
export class EudrService {
  constructor(
    @Inject('IEUDRAlertsRepository')
    private readonly alertsRepository: IEUDRAlertsRepository,
  ) {}

  async getAlerts(dto: GetEUDRAlertsDto): Promise<AlertsOutput[]> {
    return this.alertsRepository.getAlerts(dto);
  }

  async getDates(dto: GetEUDRAlertsDto): Promise<EUDRAlertDates[]> {
    return this.alertsRepository.getDates(dto);
  }
}

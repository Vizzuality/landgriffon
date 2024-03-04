import { GetEUDRAlertsDto } from 'modules/eudr-alerts/dto/get-alerts.dto';
import { AlertsOutput } from 'modules/eudr-alerts/dto/alerts-output.dto';

export class GetEUDRAlertDatesDto {
  startDate: string;
  endDate: string;
}

export type EUDRAlertDates = {
  alertDate: {
    value: Date | string;
  };
};

export interface IEUDRAlertsRepository {
  getAlerts(dto?: GetEUDRAlertsDto): Promise<AlertsOutput[]>;

  getDates(dto: GetEUDRAlertDatesDto): Promise<EUDRAlertDates[]>;
}

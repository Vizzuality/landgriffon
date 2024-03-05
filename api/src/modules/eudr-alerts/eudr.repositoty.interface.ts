import { GetEUDRAlertsDto } from 'modules/eudr-alerts/dto/get-alerts.dto';
import { AlertsOutput } from 'modules/eudr-alerts/dto/alerts-output.dto';
import { ApiProperty } from '@nestjs/swagger';

class DateValue {
  @ApiProperty()
  value: Date | string;
}

export class EUDRAlertDates {
  @ApiProperty()
  alertDate: DateValue;
}

export interface IEUDRAlertsRepository {
  getAlerts(dto?: GetEUDRAlertsDto): Promise<AlertsOutput[]>;

  getDates(dto: GetEUDRAlertsDto): Promise<EUDRAlertDates[]>;
}

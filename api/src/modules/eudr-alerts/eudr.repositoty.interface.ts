import { GetEUDRAlertsDto } from 'modules/eudr-alerts/dto/get-alerts.dto';
import { AlertsOutput } from 'modules/eudr-alerts/dto/alerts-output.dto';
import { ApiProperty } from '@nestjs/swagger';

class DateValue {
  @ApiProperty()
  value: Date;
}

export class EUDRAlertDates {
  @ApiProperty()
  alertDate: DateValue;
}

export interface EUDRAlertDatabaseResult {
  supplierid: string;
  dfs: number;
  sda: number;
}

export type GetAlertSummary = {
  alertStartDate?: Date;
  alertEnDate?: Date;
  supplierIds?: string[];
  geoRegionIds?: string[];
};

export interface IEUDRAlertsRepository {
  getAlerts(dto?: GetEUDRAlertsDto): Promise<AlertsOutput[]>;

  getDates(dto: GetEUDRAlertsDto): Promise<EUDRAlertDates[]>;

  getAlertSummary(dto: GetAlertSummary): Promise<EUDRAlertDatabaseResult[]>;
}

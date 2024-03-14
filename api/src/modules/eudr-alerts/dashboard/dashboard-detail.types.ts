import { ApiProperty } from '@nestjs/swagger';

export class EUDRDashBoardDetail {
  @ApiProperty()
  name: string;
  @ApiProperty()
  address: string;
  @ApiProperty()
  companyId: string;
  @ApiProperty({
    type: () => DashBoardDetailSourcingInformation,
    isArray: true,
  })
  sourcingInformation: DashBoardDetailSourcingInformation[];
  @ApiProperty({ type: () => DashBoardDetailAlerts, isArray: true })
  alerts: DashBoardDetailAlerts[];
}

class DashBoardDetailCountry {
  @ApiProperty()
  name: string;

  @ApiProperty()
  isoA3: string;
}

class DashBoardDetailSourcingInformation {
  @ApiProperty()
  materialName: string;
  @ApiProperty()
  hsCode: string;

  @ApiProperty({ type: () => DashBoardDetailCountry })
  country: DashBoardDetailCountry;
  @ApiProperty()
  totalArea: number;
  @ApiProperty()
  totalVolume: number;
  @ApiProperty({ type: () => ByVolume, isArray: true })
  byVolume: ByVolume[];
  @ApiProperty({ type: () => ByArea, isArray: true })
  byArea: ByArea[];
}

class ByVolume {
  @ApiProperty()
  year: number;
  @ApiProperty()
  percentage: number;
  @ApiProperty()
  volume: number;
  @ApiProperty()
  geoRegionId: string;
  @ApiProperty()
  plotName: string;
}

class ByArea {
  @ApiProperty()
  plotName: string;
  @ApiProperty()
  percentage: number;
  @ApiProperty()
  area: number;
  @ApiProperty()
  geoRegionId: string;
}

class DashBoardDetailAlerts {
  @ApiProperty()
  startAlertDate: Date;
  @ApiProperty()
  endAlertDate: number;
  @ApiProperty()
  totalAlerts: number;
  @ApiProperty({ type: () => AlertValues, isArray: true })
  values: AlertValues[];
}

class AlertValues {
  @ApiProperty()
  alertDate: string;
  @ApiProperty({ type: () => AlertPlots, isArray: true })
  plots: AlertPlots[];
}

class AlertPlots {
  @ApiProperty()
  geoRegionId: string;
  @ApiProperty()
  plotName: string;
  @ApiProperty()
  alertCount: number;
}

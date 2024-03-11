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

class DashBoardDetailSourcingInformation {
  @ApiProperty()
  materialName: string;
  @ApiProperty()
  hsCode: string;
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
  geoRegionId: string;
  @ApiProperty()
  alertCount: number;
  @ApiProperty()
  plotName: string;
}

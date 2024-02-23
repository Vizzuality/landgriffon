// Input DTO to be ingested by Carto

export class EudrInputDTO {
  supplierId: string;
  geoRegionId: string;
  geom: JSON;
  year: number;
}

export class EudrOutputDTO {
  geoRegionId: string;
  supplierId: string;
  hasEUDRAlerts: boolean;
  alertsNumber: number;
}

export type EudrDTO = EudrInputDTO & EudrOutputDTO;

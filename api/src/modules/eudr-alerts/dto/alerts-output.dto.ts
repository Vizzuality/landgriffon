import { GeoJSON } from 'geojson';

export class AlertsOutput {
  geoRegionId: string;
  supplierId: string;
  alertCount: boolean;
  geometry: GeoJSON;
  date: Date;
  year: number;
  alertConfidence: 'low' | 'medium' | 'high' | 'very high';
}

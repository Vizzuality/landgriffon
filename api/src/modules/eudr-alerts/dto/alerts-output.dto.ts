import { GeoJSON } from 'geojson';

export type AlertsOutput = {
  alertCount: boolean;
  date: Date;
  year: number;
  alertConfidence: 'low' | 'medium' | 'high' | 'very high';
};

export type AlertGeometry = {
  geometry: { value: string };
};

export type AlertsWithGeom = AlertsOutput & AlertGeometry;

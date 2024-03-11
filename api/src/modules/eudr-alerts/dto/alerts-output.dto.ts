export type AlertsOutput = {
  alertCount: number;
  alertDate: {
    value: Date | string;
  };
  year: number;
  alertConfidence: 'low' | 'medium' | 'high' | 'very high';
  geoRegionId: string;
};

export type AlertGeometry = {
  geometry: { value: string };
};

export type AlertsWithGeom = AlertsOutput & AlertGeometry;

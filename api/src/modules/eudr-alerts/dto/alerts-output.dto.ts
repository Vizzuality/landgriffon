export type AlertsOutput = {
  alertCount: boolean;
  alertDate: {
    value: Date | string;
  };
  year: number;
  alertConfidence: 'low' | 'medium' | 'high' | 'very high';
};

export type AlertGeometry = {
  geometry: { value: string };
};

export type AlertsWithGeom = AlertsOutput & AlertGeometry;

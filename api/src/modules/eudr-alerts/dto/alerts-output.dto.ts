export type AlertsOutput = {
  alertCount: number;
  alertDate: {
    value: Date | string;
  };
  year: number;
  supplierId: string;
  geoRegionId: string;
  carbonRemovals: number;
};

export type AlertGeometry = {
  geometry: { value: string };
};

export type AlertsWithGeom = AlertsOutput & AlertGeometry;

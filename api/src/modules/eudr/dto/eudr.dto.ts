// Input DTO to be ingested by Carto

import { GeoJSON } from 'geojson';

export class EudrInput {
  supplierId: string;
  geoRegionId: string;
  geom: GeoJSON;
  year: number;
}

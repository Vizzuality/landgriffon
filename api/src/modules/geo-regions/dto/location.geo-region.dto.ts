export class LocationGeoRegionDto {
  name?: string;
  radiusInMeters?: number;
  coordinates: {
    lng: number;
    lat: number;
  };
}

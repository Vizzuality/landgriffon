import { ApiProperty } from '@nestjs/swagger';
import {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
} from 'geojson';

class FeatureClass implements Feature {
  @ApiProperty()
  geometry: Geometry;
  @ApiProperty()
  properties: GeoJsonProperties;
  @ApiProperty()
  type: 'Feature';
}

class FeatureCollectionClass implements FeatureCollection {
  @ApiProperty()
  features: Feature[];
  @ApiProperty()
  type: 'FeatureCollection';
}

export class GeoFeatureResponse {
  @ApiProperty()
  geojson: FeatureClass;
}

export class GeoFeatureCollectionResponse {
  @ApiProperty()
  geojson: FeatureCollectionClass;
}

/**
 * GeoLocation Service Mock for e2e xlsx import testing
 */
import { GeoCodingBaseService } from 'modules/geo-coding/geo-coding.base.service';

export class GeolocationServiceMock extends GeoCodingBaseService {
  // eslint-disable-next-line @typescript-eslint/no-empty-function

  async geocode(any: any): Promise<any> {
    return { data: 'MOCKED' };
  }
}

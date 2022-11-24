import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'app.module';
import { GeoCodingModule } from 'modules/geo-coding/geo-coding.module';
import { AdminRegionOfProductionService } from '../../../../src/modules/geo-coding/strategies/admin-region-of-production.service';
import { clearEntityTables } from '../../../utils/database-test-helper';
import { GeoRegion } from '../../../../src/modules/geo-regions/geo-region.entity';
import { AdminRegion } from '../../../../src/modules/admin-regions/admin-region.entity';
import { LOCATION_TYPES } from '../../../../src/modules/sourcing-locations/sourcing-location.entity';
import { SourcingData } from '../../../../src/modules/import-data/sourcing-data/dto-processor.service';
import { GeoCodingError } from '../../../../src/modules/geo-coding/errors/geo-coding.error';
import { createAdminRegion, createGeoRegion } from '../../../entity-mocks';

describe('Administrative Region of Production GeoCoding Service (Integration Testing)', () => {
  let adminRegionProductionService: AdminRegionOfProductionService;

  let moduleFixture: TestingModule;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule, GeoCodingModule],
    }).compile();

    adminRegionProductionService =
      moduleFixture.get<AdminRegionOfProductionService>(
        AdminRegionOfProductionService,
      );
    await clearEntityTables([GeoRegion, AdminRegion]);
  });

  afterEach(async () => {
    await clearEntityTables([AdminRegion, GeoRegion]);
  });

  afterAll(() => moduleFixture.close());

  test(
    'When I send a Admin Region of Production type to be geocoded ' +
      'But there is not country provided' +
      'Then I should get an Error',
    async () => {
      const sourcingData = {
        locationType: LOCATION_TYPES.ADMINISTRATIVE_REGION_OF_PRODUCTION,
      } as SourcingData;

      expect.assertions(2);

      try {
        await adminRegionProductionService.geoCodeAdministrativeRegionOfProduction(
          sourcingData,
        );
      } catch (e: any) {
        expect(e instanceof GeoCodingError).toEqual(true);
        expect(e.message).toEqual(
          'A Country must be provided for Administrative Region Of Production location type',
        );
      }
    },
  );
  test(
    'When I send a Admin Region of Production type to be geocoded ' +
      'But there is not Admin Region provided' +
      'Then I should get an Error',
    async () => {
      const sourcingData = {
        locationType: LOCATION_TYPES.ADMINISTRATIVE_REGION_OF_PRODUCTION,
        locationCountryInput: 'Narnia',
      } as SourcingData;

      expect.assertions(2);

      try {
        await adminRegionProductionService.geoCodeAdministrativeRegionOfProduction(
          sourcingData,
        );
      } catch (e: any) {
        expect(e instanceof GeoCodingError).toEqual(true);
        expect(e.message).toEqual(
          'An Admin Region must be provided for Administrative Region Of Production location type',
        );
      }
    },
  );

  test(
    'When I send a Admin Region of Production type to be geocoded ' +
      'But either LAT&LNG or an Address is provided' +
      'Then I should get an Error',
    async () => {
      const sourcingDataWithCoords = {
        locationType: LOCATION_TYPES.ADMINISTRATIVE_REGION_OF_PRODUCTION,
        locationCountryInput: 'Narnia',
        locationAdminRegionInput: 'Wakanda',
        locationLatitude: 1,
      } as SourcingData;

      expect.assertions(4);

      const sourcingDataWithAddress = {
        locationType: LOCATION_TYPES.ADMINISTRATIVE_REGION_OF_PRODUCTION,
        locationCountryInput: 'Narnia',
        locationAdminRegionInput: 'Wakanda',
        locationAddressInput: 'X-MEN Headquarters',
      } as SourcingData;

      try {
        await adminRegionProductionService.geoCodeAdministrativeRegionOfProduction(
          sourcingDataWithCoords,
        );
      } catch (e: any) {
        expect(e instanceof GeoCodingError).toEqual(true);
        expect(e.message).toEqual(
          'Address and Coordinates should be empty for Administrative Region of Production location type',
        );
      }
      try {
        await adminRegionProductionService.geoCodeAdministrativeRegionOfProduction(
          sourcingDataWithAddress,
        );
      } catch (e: any) {
        expect(e instanceof GeoCodingError).toEqual(true);
        expect(e.message).toEqual(
          'Address and Coordinates should be empty for Administrative Region of Production location type',
        );
      }
    },
  );

  test(
    'When I send a Admin Region of Production type to be geocoded ' +
      'But the provided Admin Region cannot be found as a child of the provided country' +
      'Then I should get an Error',
    async () => {
      const countryGeoRegion = await createGeoRegion({ name: 'geoCountry' });
      const country: AdminRegion = await createAdminRegion({
        name: 'country',
        geoRegion: countryGeoRegion,
      });
      const region1GeoRegion = await createGeoRegion({ name: 'geoSubRegion1' });
      await createAdminRegion({
        name: 'region1',
        parent: country,
        geoRegion: region1GeoRegion,
      });
      const region2GeoRegion = await createGeoRegion({ name: 'geoSubRegion2' });
      await createAdminRegion({
        name: 'region2',
        parent: country,
        geoRegion: region2GeoRegion,
      });
      const sourcingData = {
        locationType: LOCATION_TYPES.ADMINISTRATIVE_REGION_OF_PRODUCTION,
        locationCountryInput: 'country',
        locationAdminRegionInput: 'region3',
      } as SourcingData;

      expect.assertions(2);
      try {
        await adminRegionProductionService.geoCodeAdministrativeRegionOfProduction(
          sourcingData,
        );
      } catch (e: any) {
        expect(e instanceof GeoCodingError).toEqual(true);
        expect(e.message).toEqual(
          `Admin Region of Production: ${sourcingData.locationAdminRegionInput} is not part of Country: ${country.name}`,
        );
      }
    },
  );
});

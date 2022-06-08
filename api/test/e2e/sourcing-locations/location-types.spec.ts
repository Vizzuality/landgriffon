import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { SourcingLocationsModule } from 'modules/sourcing-locations/sourcing-locations.module';
import { saveUserAndGetToken } from '../../utils/userAuth';
import { getApp } from '../../utils/getApp';
import { SourcingLocationRepository } from 'modules/sourcing-locations/sourcing-location.repository';
import { LOCATION_TYPES } from 'modules/sourcing-locations/sourcing-location.entity';
import { createSourcingLocation } from '../../entity-mocks';

describe('SourcingLocationsModule (e2e)', () => {
  let app: INestApplication;
  let sourcingLocationRepository: SourcingLocationRepository;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, SourcingLocationsModule],
    }).compile();

    sourcingLocationRepository = moduleFixture.get<SourcingLocationRepository>(
      SourcingLocationRepository,
    );

    app = getApp(moduleFixture);
    await app.init();
    jwtToken = await saveUserAndGetToken(moduleFixture, app);
  });

  afterEach(async () => {
    await sourcingLocationRepository.delete({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Sourcing locations - Location Types Endpoint', () => {
    test('Given there are Sourcing Locations with location Types in the Database, When I request the available location Types for filtering, Then I should get results in the correct format ', async () => {
      for (const locationType of Object.values(LOCATION_TYPES)) {
        await createSourcingLocation({ locationType });
        await createSourcingLocation({ locationType });
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/sourcing-locations/location-types`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.data.length).toEqual(4);
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          { label: 'Country of production', value: 'country-of-production' },
          { label: 'Aggregation point', value: 'aggregation-point' },
          { label: 'Point of production', value: 'point-of-production' },
          { label: 'Unknown', value: 'unknown' },
        ]),
      );
    });
  });
});

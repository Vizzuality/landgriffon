import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { SourcingLocationsModule } from 'modules/sourcing-locations/sourcing-locations.module';
import { SourcingLocationRepository } from 'modules/sourcing-locations/sourcing-location.repository';
import { SourcingLocationGroup } from 'modules/sourcing-location-groups/sourcing-location-group.entity';
import {
  createSourcingLocation,
  createSourcingLocationGroup,
} from '../../entity-mocks';
import { saveUserAndGetToken } from '../../utils/userAuth';
import { getApp } from '../../utils/getApp';

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

  describe('Sourcing locations - Filters', () => {
    test('When I fetch a sourcing-location and I include its relation sourcing-record-group in the query, I should receive said sourcing-location and its related sourcing-record-group', async () => {
      const sourcingLocationGroup: SourcingLocationGroup =
        await createSourcingLocationGroup();
      const sourcingLocation: SourcingLocation = await createSourcingLocation({
        sourcingLocationGroupId: sourcingLocationGroup.id,
      });
      const response = await request(app.getHttpServer())
        .get(
          `/api/v1/sourcing-locations/${sourcingLocation.id}?include=sourcingLocationGroup`,
        )
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.data.attributes.sourcingLocationGroupId).toEqual(
        sourcingLocationGroup.id,
      );
      expect(response.body.data.attributes.sourcingLocationGroup).toMatchObject(
        {
          ...sourcingLocationGroup,
          updatedAt: expect.any(String),
          createdAt: expect.any(String),
        },
      );
    });
  });
});

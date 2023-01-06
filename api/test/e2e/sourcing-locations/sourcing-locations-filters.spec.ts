import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { SourcingLocationRepository } from 'modules/sourcing-locations/sourcing-location.repository';
import { SourcingLocationGroup } from 'modules/sourcing-location-groups/sourcing-location-group.entity';
import {
  createSourcingLocation,
  createSourcingLocationGroup,
} from '../../entity-mocks';
import { saveUserAndGetTokenWithUserId } from '../../utils/userAuth';
import AppSingleton from '../../utils/getApp';
import { clearEntityTables } from '../../utils/database-test-helper';
import { User } from 'modules/users/user.entity';
import { DataSource } from 'typeorm';
import { MaterialRepository } from '../../../src/modules/materials/material.repository';

describe('SourcingLocationsModule (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let sourcingLocationRepository: SourcingLocationRepository;
  let materialRepository: MaterialRepository;
  let jwtToken: string;

  beforeAll(async () => {
    const appSingleton = await AppSingleton.init();
    app = appSingleton.app;
    const moduleFixture = appSingleton.moduleFixture;

    dataSource = moduleFixture.get<DataSource>(DataSource);

    materialRepository =
      moduleFixture.get<MaterialRepository>(MaterialRepository);
    sourcingLocationRepository = moduleFixture.get<SourcingLocationRepository>(
      SourcingLocationRepository,
    );

    ({ jwtToken } = await saveUserAndGetTokenWithUserId(moduleFixture, app));
  });

  afterEach(async () => {
    await sourcingLocationRepository.delete({});
    await materialRepository.delete({});
  });

  afterAll(async () => {
    await clearEntityTables(dataSource, [User]);
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

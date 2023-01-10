import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { SourcingLocationRepository } from 'modules/sourcing-locations/sourcing-location.repository';
import { SourcingLocationGroup } from 'modules/sourcing-location-groups/sourcing-location-group.entity';
import {
  createSourcingLocation,
  createSourcingLocationGroup,
} from '../../entity-mocks';
import { saveUserAndGetTokenWithUserId } from '../../utils/userAuth';
import ApplicationManager, {
  TestApplication,
} from '../../utils/application-manager';
import { clearTestDataFromDatabase } from '../../utils/database-test-helper';
import { DataSource } from 'typeorm';
import { MaterialRepository } from '../../../src/modules/materials/material.repository';

describe('SourcingLocationsModule (e2e)', () => {
  let testApplication: TestApplication;
  let dataSource: DataSource;
  let sourcingLocationRepository: SourcingLocationRepository;
  let materialRepository: MaterialRepository;
  let jwtToken: string;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init();

    dataSource = testApplication.get<DataSource>(DataSource);

    materialRepository =
      testApplication.get<MaterialRepository>(MaterialRepository);
    sourcingLocationRepository =
      testApplication.get<SourcingLocationRepository>(
        SourcingLocationRepository,
      );

    ({ jwtToken } = await saveUserAndGetTokenWithUserId(testApplication));
  });

  afterEach(async () => {
    await sourcingLocationRepository.delete({});
    await materialRepository.delete({});
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
  });

  describe('Sourcing locations - Filters', () => {
    test('When I fetch a sourcing-location and I include its relation sourcing-record-group in the query, I should receive said sourcing-location and its related sourcing-record-group', async () => {
      const sourcingLocationGroup: SourcingLocationGroup =
        await createSourcingLocationGroup();
      const sourcingLocation: SourcingLocation = await createSourcingLocation({
        sourcingLocationGroupId: sourcingLocationGroup.id,
      });
      const response = await request(testApplication.getHttpServer())
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

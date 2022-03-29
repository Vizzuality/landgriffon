import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import {
  SourcingLocation,
  SOURCING_LOCATION_TYPE_BY_INTERVENTION,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { SourcingLocationsModule } from 'modules/sourcing-locations/sourcing-locations.module';
import { SourcingLocationRepository } from 'modules/sourcing-locations/sourcing-location.repository';
import {
  createMaterial,
  createScenarioIntervention,
  createSourcingLocation,
} from '../../entity-mocks';
import { Material } from 'modules/materials/material.entity';
import { saveUserAndGetTokenWithUserId } from '../../utils/userAuth';
import { getApp } from '../../utils/getApp';
import { ScenarioIntervention } from 'modules/scenario-interventions/scenario-intervention.entity';

/**
 * Tests for the SourcingLocationsModule.
 */

describe('SourcingLocationsModule (e2e)', () => {
  let app: INestApplication;
  let sourcingLocationRepository: SourcingLocationRepository;
  let jwtToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, SourcingLocationsModule],
    }).compile();

    sourcingLocationRepository = moduleFixture.get<SourcingLocationRepository>(
      SourcingLocationRepository,
    );

    app = getApp(moduleFixture);
    await app.init();

    const tokenWithId = await saveUserAndGetTokenWithUserId(moduleFixture, app);
    jwtToken = tokenWithId.jwtToken;
    userId = tokenWithId.userId;
  });

  afterEach(async () => {
    await sourcingLocationRepository.delete({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Sourcing locations - Create', () => {
    test('Create a sourcing location should be successful (happy case)', async () => {
      const material: Material = await createMaterial();
      const response = await request(app.getHttpServer())
        .post('/api/v1/sourcing-locations')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'test sourcing location',
          locationAddressInput: 'pqrst',
          locationCountryInput: 'uvwxy',
          materialId: material.id,
        })
        .expect(HttpStatus.CREATED);

      const createdSourcingLocation = await sourcingLocationRepository.findOne(
        response.body.data.id,
      );

      if (!createdSourcingLocation) {
        throw new Error('Error loading created Sourcing location');
      }

      expect(createdSourcingLocation.title).toEqual('test sourcing location');
    });

    /**
     * @debt Add this test when CreateSourcingLocation DTO validation decorator issue is fixed
     */
    test.skip('Create a sourcing location without the required fields should fail with a 400 error', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/sourcing-locations')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.BAD_REQUEST);

      expect(response).toHaveErrorMessage(
        HttpStatus.BAD_REQUEST,
        'Bad Request Exception',
        [
          'title should not be empty',
          'title must be shorter than or equal to 40 characters',
          'title must be longer than or equal to 2 characters',
          'title must be a string',
        ],
      );
    });
  });

  describe('Sourcing locations - Update', () => {
    test('Update a sourcing location should be successful (happy case)', async () => {
      const sourcingLocation: SourcingLocation = await createSourcingLocation({
        title: 'test sourcing location',
      });

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/sourcing-locations/${sourcingLocation.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'updated test sourcing location',
        })
        .expect(HttpStatus.OK);

      const updatedSourcingLocation =
        await sourcingLocationRepository.findOneOrFail(sourcingLocation.id);

      expect(updatedSourcingLocation.updatedById).toEqual(userId);

      expect(response.body.data.attributes.title).toEqual(
        'updated test sourcing location',
      );
    });
  });

  describe('Sourcing locations - Delete', () => {
    test('Delete a sourcing location should be successful (happy case)', async () => {
      const sourcingLocation: SourcingLocation = await createSourcingLocation();

      await request(app.getHttpServer())
        .delete(`/api/v1/sourcing-locations/${sourcingLocation.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(
        await sourcingLocationRepository.findOne(sourcingLocation.id),
      ).toBeUndefined();
    });
  });

  describe('Sourcing locations - Get all', () => {
    test('Get all sourcing locations should be successful (happy case)', async () => {
      const sourcingLocation: SourcingLocation = await createSourcingLocation();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/sourcing-locations`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data[0].id).toEqual(sourcingLocation.id);
    });

    test('Get all sourcing locations should be successful, sourcing locations of the interventions must me ignored (happy case)', async () => {
      const sourcingLocation: SourcingLocation = await createSourcingLocation();

      const scenarioIntervention: ScenarioIntervention =
        await createScenarioIntervention();

      await createSourcingLocation({
        scenarioInterventionId: scenarioIntervention.id,
        interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED,
      });

      await createSourcingLocation({
        scenarioInterventionId: scenarioIntervention.id,
        interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
      });

      const response = await request(app.getHttpServer())
        .get(`/api/v1/sourcing-locations`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data[0].id).toEqual(sourcingLocation.id);
      expect(response.body.data.length).toEqual(1);
    });
  });

  describe('Sourcing locations - Get by id', () => {
    test('Get a sourcing location by id should be successful (happy case)', async () => {
      const sourcingLocation: SourcingLocation = await createSourcingLocation();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/sourcing-locations/${sourcingLocation.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toEqual(sourcingLocation.id);
    });
  });
});

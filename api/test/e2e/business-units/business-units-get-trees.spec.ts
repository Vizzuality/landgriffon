import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { BusinessUnitRepository } from 'modules/business-units/business-unit.repository';
import { saveUserAndGetTokenWithUserId } from '../../utils/userAuth';
import ApplicationManager, {
  TestApplication,
} from '../../utils/application-manager';
import { createBusinessUnit, createSourcingLocation } from '../../entity-mocks';
import { clearTestDataFromDatabase } from '../../utils/database-test-helper';
import { DataSource } from 'typeorm';

/**
 * Tests for the BusinessUnitsModule.
 */

describe('BusinessUnits - Get Trees', () => {
  let testApplication: TestApplication;
  let dataSource: DataSource;
  let businessUnitRepository: BusinessUnitRepository;
  let jwtToken: string;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init();

    dataSource = testApplication.get<DataSource>(DataSource);

    businessUnitRepository = testApplication.get<BusinessUnitRepository>(
      BusinessUnitRepository,
    );

    ({ jwtToken } = await saveUserAndGetTokenWithUserId(testApplication));
  });

  afterEach(async () => {
    await businessUnitRepository.delete({});
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
  });

  describe('Business units - Get Trees', () => {
    test('When I request business units trees, and the DB is empty, then I should get empty array', async () => {
      const response = await request(testApplication.getHttpServer())
        .get(`/api/v1/business-units/trees`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data).toStrictEqual([]);
    });

    test(
      'When I query a Supplier Tree endpoint ' +
        'And I query the ones with sourcing locations' +
        'Then I should receive a tree list of suppliers where there are sourcing-locations for' +
        'And if any of them is a child supplier, I should get its parent too',
      async () => {
        const parentBusinessUnits: BusinessUnit = await createBusinessUnit({
          name: 'parentBusinessUnit',
        });
        const childBusinessUnit: BusinessUnit = await createBusinessUnit({
          name: 'childBusinessUnit',
          parent: parentBusinessUnits,
        });

        const parentWithNoChildBusinessUnit: BusinessUnit =
          await createBusinessUnit({
            name: 'parentWithNoChild',
          });
        const businessUnitNotPresentInSourcingLocations: BusinessUnit =
          await createBusinessUnit({
            name: 'businessUnitNotPresentInSourcingLocations',
          });

        for await (const businessUnit of [
          childBusinessUnit,
          parentWithNoChildBusinessUnit,
        ]) {
          await createSourcingLocation({ businessUnitId: businessUnit.id });
        }

        const response = await request(testApplication.getHttpServer())
          .get('/api/v1/business-units/trees')
          .query({ withSourcingLocations: true })
          .set('Authorization', `Bearer ${jwtToken}`);

        expect(HttpStatus.OK);
        expect(response.body.data[1].id).toEqual(
          parentWithNoChildBusinessUnit.id,
        );
        expect(response.body.data[1].attributes.children).toEqual([]);
        expect(response.body.data[0].id).toEqual(parentBusinessUnits.id);
        expect(response.body.data[0].attributes.children[0].id).toEqual(
          childBusinessUnit.id,
        );
        expect(
          response.body.data.find(
            (material: BusinessUnit) =>
              material.id === businessUnitNotPresentInSourcingLocations.id,
          ),
        ).toBe(undefined);
      },
    );
  });
});

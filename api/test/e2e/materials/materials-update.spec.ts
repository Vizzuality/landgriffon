import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { Material } from 'modules/materials/material.entity';
import { MaterialRepository } from 'modules/materials/material.repository';
import { createMaterial } from '../../entity-mocks';
import { expectedJSONAPIAttributes } from './config';
import { saveUserAndGetTokenWithUserId } from '../../utils/userAuth';
import { clearTestDataFromDatabase } from '../../utils/database-test-helper';
import { DataSource } from 'typeorm';
import ApplicationManager, {
  TestApplication,
} from '../../utils/application-manager';

describe('Materials - Update', () => {
  let testApplication: TestApplication;
  let dataSource: DataSource;
  let materialRepository: MaterialRepository;
  let jwtToken: string;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init();

    dataSource = testApplication.get<DataSource>(DataSource);

    materialRepository =
      testApplication.get<MaterialRepository>(MaterialRepository);

    ({ jwtToken } = await saveUserAndGetTokenWithUserId(testApplication));
  });

  afterEach(async () => {
    await materialRepository.delete({});
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
  });

  test('Update a material should be successful (happy case)', async () => {
    const material: Material = await createMaterial();

    const response = await request(testApplication.getHttpServer())
      .patch(`/api/v1/materials/${material.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'updated test material',
      })
      .expect(HttpStatus.OK);

    expect(response.body.data.attributes.name).toEqual('updated test material');
    expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
  });

  test("Update a material's parentId should be successful", async () => {
    const materialOne: Material = await createMaterial();
    const materialTwo: Material = await createMaterial();

    const responseOne = await request(testApplication.getHttpServer())
      .patch(`/api/v1/materials/${materialOne.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        parentId: materialTwo.id,
      })
      .expect(HttpStatus.OK);

    expect(responseOne).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
    expect(responseOne.body.data.attributes.parentId).toEqual(materialTwo.id);

    const responseTwo = await request(testApplication.getHttpServer())
      .patch(`/api/v1/materials/${materialOne.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        parentId: null,
      })
      .expect(HttpStatus.OK);

    expect(responseTwo.body.data.attributes.parentId).toEqual(null);
  });
});

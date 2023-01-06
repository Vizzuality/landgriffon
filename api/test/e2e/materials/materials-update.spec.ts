import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Material } from 'modules/materials/material.entity';
import { MaterialRepository } from 'modules/materials/material.repository';
import { createMaterial } from '../../entity-mocks';
import { expectedJSONAPIAttributes } from './config';
import { saveUserAndGetTokenWithUserId } from '../../utils/userAuth';
import { clearEntityTables } from '../../utils/database-test-helper';
import { User } from 'modules/users/user.entity';
import { DataSource } from 'typeorm';
import AppSingleton from '../../utils/getApp';

describe('Materials - Update', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let materialRepository: MaterialRepository;
  let jwtToken: string;

  beforeAll(async () => {
    const appSingleton = await AppSingleton.init();
    app = appSingleton.app;
    const moduleFixture = appSingleton.moduleFixture;

    dataSource = moduleFixture.get<DataSource>(DataSource);

    materialRepository =
      moduleFixture.get<MaterialRepository>(MaterialRepository);

    ({ jwtToken } = await saveUserAndGetTokenWithUserId(moduleFixture, app));
  });

  afterEach(async () => {
    await materialRepository.delete({});
  });

  afterAll(async () => {
    await clearEntityTables(dataSource, [User]);
    await app.close();
  });

  test('Update a material should be successful (happy case)', async () => {
    const material: Material = await createMaterial();

    const response = await request(app.getHttpServer())
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

    const responseOne = await request(app.getHttpServer())
      .patch(`/api/v1/materials/${materialOne.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        parentId: materialTwo.id,
      })
      .expect(HttpStatus.OK);

    expect(responseOne).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
    expect(responseOne.body.data.attributes.parentId).toEqual(materialTwo.id);

    const responseTwo = await request(app.getHttpServer())
      .patch(`/api/v1/materials/${materialOne.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        parentId: null,
      })
      .expect(HttpStatus.OK);

    expect(responseTwo.body.data.attributes.parentId).toEqual(null);
  });
});

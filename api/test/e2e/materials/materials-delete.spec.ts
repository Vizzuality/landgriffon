import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Material } from 'modules/materials/material.entity';
import { MaterialRepository } from 'modules/materials/material.repository';
import { createMaterial } from '../../entity-mocks';
import { saveUserAndGetTokenWithUserId } from '../../utils/userAuth';
import AppSingleton from '../../utils/getApp';
import { clearTestDataFromDatabase } from '../../utils/database-test-helper';
import { DataSource } from 'typeorm';

describe('Materials - Delete', () => {
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
    await clearTestDataFromDatabase(dataSource);
    await app.close();
  });

  test('Delete a material should be successful (happy case)', async () => {
    const material: Material = await createMaterial();

    await request(app.getHttpServer())
      .delete(`/api/v1/materials/${material.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.OK);

    expect(
      await materialRepository.findOne({ where: { id: material.id } }),
    ).toBeNull();
  });
});

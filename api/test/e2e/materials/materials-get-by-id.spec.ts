import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { Material } from 'modules/materials/material.entity';
import { MaterialsModule } from 'modules/materials/materials.module';
import { MaterialRepository } from 'modules/materials/material.repository';
import { createMaterial } from '../../entity-mocks';
import { expectedJSONAPIAttributes } from './config';
import { saveUserAndGetToken } from '../../utils/userAuth';
import { getApp } from '../../utils/getApp';

describe('Materials - Get by id', () => {
  let app: INestApplication;
  let materialRepository: MaterialRepository;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, MaterialsModule],
    }).compile();

    materialRepository =
      moduleFixture.get<MaterialRepository>(MaterialRepository);

    app = getApp(moduleFixture);
    await app.init();
    jwtToken = await saveUserAndGetToken(moduleFixture, app);
  });

  afterEach(async () => {
    await materialRepository.delete({});
  });

  afterAll(async () => {
    await app.close();
  });

  test('Get a material by id should be successful (happy case)', async () => {
    const material: Material = await createMaterial();

    const response = await request(app.getHttpServer())
      .get(`/api/v1/materials/${material.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.OK);

    expect(response.body.data.id).toEqual(material.id);
    expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
  });
});

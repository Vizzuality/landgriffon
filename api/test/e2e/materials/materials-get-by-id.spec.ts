import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { Material } from 'modules/materials/material.entity';
import { MaterialsModule } from 'modules/materials/materials.module';
import { MaterialRepository } from 'modules/materials/material.repository';
import { createMaterial } from '../../entity-mocks';
import { expectedJSONAPIAttributes } from './config';
import { E2E_CONFIG } from '../../e2e.config';

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

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    await request(app.getHttpServer())
      .post('/auth/sign-up')
      .send(E2E_CONFIG.users.signUp)
      .expect(HttpStatus.CREATED);
    const response = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send(E2E_CONFIG.users.signIn)
      .expect(HttpStatus.CREATED);
    jwtToken = response.body.accessToken;
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

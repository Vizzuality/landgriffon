import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { MaterialsModule } from 'modules/materials/materials.module';
import { MaterialRepository } from 'modules/materials/material.repository';
import { createMaterial } from '../../entity-mocks';
import { Material } from 'modules/materials/material.entity';
import { expectedJSONAPIAttributes } from './config';
import { v4 as uuidv4 } from 'uuid';
import { saveUserAndGetTokenWithUserId } from '../../utils/userAuth';
import AppSingleton from '../../utils/getApp';
import { clearEntityTables } from '../../utils/database-test-helper';
import { User } from 'modules/users/user.entity';
import { DataSource } from 'typeorm';

describe('Materials - Create', () => {
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

  test('Create a material should be successful (happy case)', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/materials')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'test material',
        hsCodeId: 'test',
      })
      .expect(HttpStatus.CREATED);

    const createdMaterial = await materialRepository.findOne({
      where: { id: response.body.data.id },
    });

    if (!createdMaterial) {
      throw new Error('Error loading created Material');
    }

    expect(createdMaterial.name).toEqual('test material');
    expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
  });

  test('Create a material without the required fields should fail with a 400 error', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/materials')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.BAD_REQUEST);
    expect(response).toHaveErrorMessage(
      HttpStatus.BAD_REQUEST,
      'Bad Request Exception',
      [
        'name must be a string',
        'name must be longer than or equal to 2 characters',
        'name must be shorter than or equal to 300 characters',
        'name should not be empty',
        'hsCodeId must be a string',
      ],
    );
  });

  describe('Tree structure', () => {
    test('Create a material without a parent should be successful', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/materials')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name: 'test material',
          hsCodeId: 'testCode',
        })
        .expect(HttpStatus.CREATED);

      expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
    });

    test('Create a material with a parent id that does not exist should fail with a 400 error', async () => {
      const uuid = uuidv4();
      const response = await request(app.getHttpServer())
        .post('/api/v1/materials')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name: 'test material',
          hsCodeId: 'testCode',
          parentId: uuid,
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response).toHaveErrorMessage(
        400,
        `Parent material with ID "${uuid}" not found`,
      );
    });

    test('Create a material with a parent id that exists should be successful and return the associated parent id', async () => {
      const material: Material = await createMaterial();

      const response = await request(app.getHttpServer())
        .post('/api/v1/materials')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name: 'test material',
          hsCodeId: 'testCode',
          parentId: material.id,
        })
        .expect(HttpStatus.CREATED);

      expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
      expect(response.body.data.attributes.parentId).toEqual(material.id);
    });
  });
});

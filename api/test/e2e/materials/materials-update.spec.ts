import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { Material } from 'modules/materials/material.entity';
import { MaterialsModule } from 'modules/materials/materials.module';
import { MaterialRepository } from 'modules/materials/material.repository';
import { createMaterial } from '../../entity-mocks';
import { expectedJSONAPIAttributes } from './config';

describe('Materials - Update', () => {
  let app: INestApplication;
  let materialRepository: MaterialRepository;

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
  });

  afterEach(async () => {
    await materialRepository.delete({});
  });

  afterAll(async () => {
    await app.close();
  });

  test('Update a material should be successful (happy case)', async () => {
    const material: Material = await createMaterial();

    const response = await request(app.getHttpServer())
      .patch(`/api/v1/materials/${material.id}`)
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
      .send({
        parentId: materialTwo.id,
      })
      .expect(HttpStatus.OK);

    expect(responseOne).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
    expect(responseOne.body.data.attributes.parentId).toEqual(materialTwo.id);

    const responseTwo = await request(app.getHttpServer())
      .patch(`/api/v1/materials/${materialOne.id}`)
      .send({
        parentId: null,
      })
      .expect(HttpStatus.OK);

    expect(responseTwo.body.data.attributes.parentId).toEqual(null);
  });
});

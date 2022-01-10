import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { SuppliersModule } from 'modules/suppliers/suppliers.module';
import { SupplierRepository } from 'modules/suppliers/supplier.repository';
import { createSupplier } from '../../entity-mocks';
import { expectedJSONAPIAttributes } from './config';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { E2E_CONFIG } from '../../e2e.config';

describe('Suppliers - Create', () => {
  let app: INestApplication;
  let supplierRepository: SupplierRepository;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, SuppliersModule],
    }).compile();

    supplierRepository =
      moduleFixture.get<SupplierRepository>(SupplierRepository);

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
    await supplierRepository.delete({});
  });

  afterAll(async () => {
    await app.close();
  });

  test('Create a supplier should be successful (happy case)', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/suppliers')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'test supplier',
      })
      .expect(HttpStatus.CREATED);

    const createdSupplier = await supplierRepository.findOne(
      response.body.data.id,
    );

    if (!createdSupplier) {
      throw new Error('Error loading created Supplier');
    }

    expect(createdSupplier.name).toEqual('test supplier');
    expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
  });

  test('Create a supplier without the required fields should fail with a 400 error', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/suppliers')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.BAD_REQUEST);

    expect(response).toHaveErrorMessage(
      HttpStatus.BAD_REQUEST,
      'Bad Request Exception',
      [
        'name should not be empty',
        'name must be shorter than or equal to 40 characters',
        'name must be longer than or equal to 2 characters',
        'name must be a string',
      ],
    );
  });

  describe('Tree structure', () => {
    test('Create a supplier without a parent should be successful', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/suppliers')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name: 'test supplier',
        })
        .expect(HttpStatus.CREATED);

      expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
    });

    test('Create a supplier with a parent id that does not exist should fail with a 400 error', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/suppliers')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name: 'test supplier',
          parentId: 'abcdefg',
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response).toHaveErrorMessage(
        400,
        `Parent supplier with ID "abcdefg" not found`,
      );
    });

    test('Create a supplier with a parent id that exists should be successful and return the associated parent id', async () => {
      const supplier: Supplier = await createSupplier();

      const response = await request(app.getHttpServer())
        .post('/api/v1/suppliers')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name: 'test supplier',
          parentId: supplier.id,
        })
        .expect(HttpStatus.CREATED);

      expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
      expect(response.body.data.attributes.parentId).toEqual(supplier.id);
    });
  });
});

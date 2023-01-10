import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { SupplierRepository } from 'modules/suppliers/supplier.repository';
import { createSupplier } from '../../entity-mocks';
import { expectedJSONAPIAttributes } from './config';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { saveUserAndGetTokenWithUserId } from '../../utils/userAuth';
import ApplicationManager, {
  TestApplication,
} from '../../utils/application-manager';
import { clearTestDataFromDatabase } from '../../utils/database-test-helper';
import { DataSource } from 'typeorm';

describe('Suppliers - Create', () => {
  let testApplication: TestApplication;
  let dataSource: DataSource;
  let supplierRepository: SupplierRepository;
  let jwtToken: string;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init();

    dataSource = testApplication.get<DataSource>(DataSource);

    supplierRepository =
      testApplication.get<SupplierRepository>(SupplierRepository);

    ({ jwtToken } = await saveUserAndGetTokenWithUserId(testApplication));
  });

  afterEach(async () => {
    await supplierRepository.delete({});
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
  });

  test('Create a supplier should be successful (happy case)', async () => {
    const response = await request(testApplication.getHttpServer())
      .post('/api/v1/suppliers')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'test supplier',
      })
      .expect(HttpStatus.CREATED);

    const createdSupplier = await supplierRepository.findOne({
      where: { id: response.body.data.id },
    });

    if (!createdSupplier) {
      throw new Error('Error loading created Supplier');
    }

    expect(createdSupplier.name).toEqual('test supplier');
    expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
  });

  test('Create a supplier with name smaller or equal to 300 characters should be successful', async () => {
    const response = await request(testApplication.getHttpServer())
      .post('/api/v1/suppliers')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'i'.repeat(300),
      })
      .expect(HttpStatus.CREATED);

    const createdSupplier = await supplierRepository.findOne({
      where: { id: response.body.data.id },
    });

    if (!createdSupplier) {
      throw new Error('Error loading created Supplier');
    }

    expect(createdSupplier.name).toEqual('i'.repeat(300));
    expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
  });

  test('Create a supplier with name bigger than 1000 characters should return bad request error', async () => {
    const response = await request(testApplication.getHttpServer())
      .post('/api/v1/suppliers')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'i'.repeat(1001),
      })
      .expect(HttpStatus.BAD_REQUEST);

    expect(response).toHaveErrorMessage(
      HttpStatus.BAD_REQUEST,
      'Bad Request Exception',
      ['name must be shorter than or equal to 1000 characters'],
    );
  });

  test('Create a supplier without the required fields should fail with a 400 error', async () => {
    const response = await request(testApplication.getHttpServer())
      .post('/api/v1/suppliers')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.BAD_REQUEST);

    expect(response).toHaveErrorMessage(
      HttpStatus.BAD_REQUEST,
      'Bad Request Exception',
      [
        'name should not be empty',
        'name must be shorter than or equal to 1000 characters',
        'name must be longer than or equal to 1 characters',
        'name must be a string',
      ],
    );
  });

  describe('Tree structure', () => {
    test('Create a supplier without a parent should be successful', async () => {
      const response = await request(testApplication.getHttpServer())
        .post('/api/v1/suppliers')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name: 'test supplier',
        })
        .expect(HttpStatus.CREATED);

      expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
    });

    test('Create a supplier with a parent id that does not exist should fail with a 400 error', async () => {
      const response = await request(testApplication.getHttpServer())
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

      const response = await request(testApplication.getHttpServer())
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

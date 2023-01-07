import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { SupplierRepository } from 'modules/suppliers/supplier.repository';
import { createSupplier } from '../../entity-mocks';
import { expectedJSONAPIAttributes } from './config';
import { saveUserAndGetTokenWithUserId } from '../../utils/userAuth';
import AppSingleton from '../../utils/getApp';
import { clearTestDataFromDatabase } from '../../utils/database-test-helper';
import { DataSource } from 'typeorm';

describe('Suppliers - Update', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let supplierRepository: SupplierRepository;
  let jwtToken: string;

  beforeAll(async () => {
    const appSingleton = await AppSingleton.init();
    app = appSingleton.app;
    const moduleFixture = appSingleton.moduleFixture;

    dataSource = moduleFixture.get<DataSource>(DataSource);

    supplierRepository =
      moduleFixture.get<SupplierRepository>(SupplierRepository);

    ({ jwtToken } = await saveUserAndGetTokenWithUserId(moduleFixture, app));
  });

  afterEach(async () => {
    await supplierRepository.delete({});
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await app.close();
  });

  test('Update a supplier should be successful (happy case)', async () => {
    const supplier: Supplier = await createSupplier();

    const response = await request(app.getHttpServer())
      .patch(`/api/v1/suppliers/${supplier.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'updated test supplier',
      })
      .expect(HttpStatus.OK);

    expect(response.body.data.attributes.name).toEqual('updated test supplier');
    expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
  });

  test('Update a supplier name with length more than 300 should return bad request error', async () => {
    const supplier: Supplier = await createSupplier();
    const response = await request(app.getHttpServer())
      .patch(`/api/v1/suppliers/${supplier.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'i'.repeat(301),
      })
      .expect(HttpStatus.BAD_REQUEST);

    expect(response).toHaveErrorMessage(
      HttpStatus.BAD_REQUEST,
      'Bad Request Exception',
      ['name must be shorter than or equal to 300 characters'],
    );
  });

  test('Update a supplier name with length less or equal to 300 should be successful', async () => {
    const supplier: Supplier = await createSupplier();
    await request(app.getHttpServer())
      .patch(`/api/v1/suppliers/${supplier.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'i'.repeat(300),
      })
      .expect(HttpStatus.OK);
  });

  test("Update a supplier's parentId should be successful", async () => {
    const supplierOne: Supplier = await createSupplier();
    const supplierTwo: Supplier = await createSupplier();

    const responseOne = await request(app.getHttpServer())
      .patch(`/api/v1/suppliers/${supplierOne.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        parentId: supplierTwo.id,
      })
      .expect(HttpStatus.OK);

    expect(responseOne).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
    expect(responseOne.body.data.attributes.parentId).toEqual(supplierTwo.id);

    const responseTwo = await request(app.getHttpServer())
      .patch(`/api/v1/suppliers/${supplierOne.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        parentId: null,
      })
      .expect(HttpStatus.OK);

    expect(responseTwo.body.data.attributes.parentId).toEqual(null);
  });
});

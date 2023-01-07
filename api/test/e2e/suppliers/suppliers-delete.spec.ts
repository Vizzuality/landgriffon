import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { SupplierRepository } from 'modules/suppliers/supplier.repository';
import { createSupplier } from '../../entity-mocks';
import { saveUserAndGetTokenWithUserId } from '../../utils/userAuth';
import AppSingleton from '../../utils/getApp';
import { clearTestDataFromDatabase } from '../../utils/database-test-helper';
import { DataSource } from 'typeorm';

describe('Suppliers - Delete', () => {
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

  test('Delete a supplier should be successful (happy case)', async () => {
    const supplier: Supplier = await createSupplier();

    await request(app.getHttpServer())
      .delete(`/api/v1/suppliers/${supplier.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.OK);

    expect(
      await supplierRepository.findOne({ where: { id: supplier.id } }),
    ).toBeNull();
  });
});

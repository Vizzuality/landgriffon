import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { SupplierRepository } from 'modules/suppliers/supplier.repository';
import { expectedJSONAPIAttributes } from './config';
import { setupTestUser } from '../../utils/userAuth';
import ApplicationManager, {
  TestApplication,
} from '../../utils/application-manager';
import { clearTestDataFromDatabase } from '../../utils/database-test-helper';
import { DataSource } from 'typeorm';

describe('Suppliers - Get by id', () => {
  let testApplication: TestApplication;
  let dataSource: DataSource;
  let supplierRepository: SupplierRepository;
  let jwtToken: string;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init();

    dataSource = testApplication.get<DataSource>(DataSource);

    supplierRepository =
      testApplication.get<SupplierRepository>(SupplierRepository);

    ({ jwtToken } = await setupTestUser(testApplication));
  });

  afterEach(async () => {
    await supplierRepository.delete({});
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
  });

  describe('Suppliers - Get by id', () => {
    test('Get a supplier by id should be successful (happy case)', async () => {
      const supplier: Supplier = new Supplier();
      supplier.name = 'test supplier';
      await supplier.save();

      const response = await request(testApplication.getHttpServer())
        .get(`/api/v1/suppliers/${supplier.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toEqual(supplier.id);
      expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
    });
  });
});

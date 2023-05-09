import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { SUPPLIER_TYPES } from 'modules/suppliers/supplier.entity';
import { SupplierRepository } from 'modules/suppliers/supplier.repository';
import { setupTestUser } from '../../utils/userAuth';
import ApplicationManager, {
  TestApplication,
} from '../../utils/application-manager';
import { createSupplier } from '../../entity-mocks';
import { clearTestDataFromDatabase } from '../../utils/database-test-helper';
import { DataSource } from 'typeorm';
import { MaterialRepository } from 'modules/materials/material.repository';

describe('Suppliers - Get by type', () => {
  let testApplication: TestApplication;
  let dataSource: DataSource;
  let supplierRepository: SupplierRepository;
  let materialRepository: MaterialRepository;
  let jwtToken: string;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init();

    dataSource = testApplication.get<DataSource>(DataSource);

    supplierRepository =
      testApplication.get<SupplierRepository>(SupplierRepository);

    materialRepository =
      testApplication.get<MaterialRepository>(MaterialRepository);

    ({ jwtToken } = await setupTestUser(testApplication));
  });

  afterEach(async () => {
    await supplierRepository.delete({});
    await materialRepository.delete({});
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
  });

  describe('Suppliers - Get by type', () => {
    test(
      'When I query the API to get a supplier' +
        'And I filter by an available type of Supplier' +
        'Then I should get all available suppliers from the selected type',
      async () => {
        for await (const number of [1, 2, 3, 4]) {
          await createSupplier({
            name: `T1 Supplier ${number}`,
            type: SUPPLIER_TYPES.T1SUPPLIER,
          });
        }
        for await (const number of [1, 2, 3, 4]) {
          await createSupplier({
            name: `Producer ${number}`,
            type: SUPPLIER_TYPES.PRODUCER,
          });
        }

        const t1SupplierResponse = await request(
          testApplication.getHttpServer(),
        )
          .get(`/api/v1/suppliers/types`)
          .query({ type: SUPPLIER_TYPES.T1SUPPLIER })
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(HttpStatus.OK);

        t1SupplierResponse.body.data
          .sort((a: Record<string, any>, b: Record<string, any>) =>
            a.attributes.name < b.attributes.name ? -1 : a > b ? 1 : 0,
          )
          .forEach((supplier: any, i: number) => {
            expect(supplier.attributes.name).toEqual(`T1 Supplier ${i + 1}`);
          });

        const producerResponse = await request(testApplication.getHttpServer())
          .get(`/api/v1/suppliers/types`)
          .query({ type: SUPPLIER_TYPES.PRODUCER })
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(HttpStatus.OK);

        producerResponse.body.data
          .sort((a: Record<string, any>, b: Record<string, any>) =>
            a.attributes.name < b.attributes.name ? -1 : a > b ? 1 : 0,
          )
          .forEach((supplier: any, i: number) => {
            expect(supplier.attributes.name).toEqual(`Producer ${i + 1}`);
          });
      },
    );
    test(
      'When I query the API to get a supplier' +
        'And I filter by a wrong type of Supplier' +
        'Then I should get a proper error message',
      async () => {
        const response = await request(testApplication.getHttpServer())
          .get(`/api/v1/suppliers/types`)
          .query({ type: 'I have not sell anything in my life' })
          .set('Authorization', `Bearer ${jwtToken}`)
          .send();

        expect(HttpStatus.BAD_REQUEST);
        expect(
          response.body.errors[0].meta.rawError.response.message[0],
        ).toEqual('Allowed Supplier types: t1supplier, producer');
      },
    );
  });
});

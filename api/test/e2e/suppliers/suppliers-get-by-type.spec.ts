import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Supplier, SUPPLIER_TYPES } from 'modules/suppliers/supplier.entity';
import { SupplierRepository } from 'modules/suppliers/supplier.repository';
import { saveUserAndGetTokenWithUserId } from '../../utils/userAuth';
import AppSingleton from '../../utils/getApp';
import { createSourcingLocation, createSupplier } from '../../entity-mocks';
import { clearEntityTables } from '../../utils/database-test-helper';
import { User } from 'modules/users/user.entity';
import { DataSource } from 'typeorm';
import { MaterialRepository } from '../../../src/modules/materials/material.repository';

describe('Suppliers - Get by type', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let supplierRepository: SupplierRepository;
  let materialRepository: MaterialRepository;
  let jwtToken: string;

  beforeAll(async () => {
    const appSingleton = await AppSingleton.init();
    app = appSingleton.app;
    const moduleFixture = appSingleton.moduleFixture;

    dataSource = moduleFixture.get<DataSource>(DataSource);

    supplierRepository =
      moduleFixture.get<SupplierRepository>(SupplierRepository);

    materialRepository =
      moduleFixture.get<MaterialRepository>(MaterialRepository);

    ({ jwtToken } = await saveUserAndGetTokenWithUserId(moduleFixture, app));
  });

  afterEach(async () => {
    await supplierRepository.delete({});
    await materialRepository.delete({});
  });

  afterAll(async () => {
    await clearEntityTables(dataSource, [User]);
    await app.close();
  });

  describe('Suppliers - Get by type', () => {
    test(
      'When I query the API to get a supplier' +
        'And I filter by an available type of Supplier' +
        'Then I should get all available suppliers from the selected type',
      async () => {
        for await (const number of [1, 2, 3, 4]) {
          const supplier: Supplier = await createSupplier({
            name: `T1 Supplier ${number}`,
          });
          await createSourcingLocation({ t1SupplierId: supplier.id });
        }
        for await (const number of [1, 2, 3, 4]) {
          const supplier: Supplier = await createSupplier({
            name: `Producer ${number}`,
          });
          await createSourcingLocation({ producerId: supplier.id });
        }

        const t1SupplierResponse = await request(app.getHttpServer())
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

        const producerResponse = await request(app.getHttpServer())
          .get(`/api/v1/suppliers/types`)
          .query({ type: SUPPLIER_TYPES.PRODUCER })
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(HttpStatus.OK);

        producerResponse.body.data.forEach((supplier: any, i: number) => {
          expect(supplier.attributes.name).toEqual(`Producer ${i + 1}`);
        });
      },
    );
    test(
      'When I query the API to get a supplier' +
        'And I filter by a wrong type of Supplier' +
        'Then I should get a proper error message',
      async () => {
        const response = await request(app.getHttpServer())
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

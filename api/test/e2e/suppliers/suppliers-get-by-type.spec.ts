import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { Supplier, SUPPLIER_TYPES } from 'modules/suppliers/supplier.entity';
import { SuppliersModule } from 'modules/suppliers/suppliers.module';
import { SupplierRepository } from 'modules/suppliers/supplier.repository';
import { saveAdminAndGetToken } from '../../utils/userAuth';
import { getApp } from '../../utils/getApp';
import { createSourcingLocation, createSupplier } from '../../entity-mocks';

describe('Suppliers - Get by type', () => {
  let app: INestApplication;
  let supplierRepository: SupplierRepository;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, SuppliersModule],
    }).compile();

    supplierRepository =
      moduleFixture.get<SupplierRepository>(SupplierRepository);

    app = getApp(moduleFixture);
    await app.init();
    jwtToken = await saveAdminAndGetToken(moduleFixture, app);
  });

  afterEach(async () => {
    await supplierRepository.delete({});
  });

  afterAll(async () => {
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

        t1SupplierResponse.body.data.forEach((supplier: any, i: number) => {
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

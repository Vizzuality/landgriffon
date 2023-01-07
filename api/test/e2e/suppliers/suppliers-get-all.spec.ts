import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Supplier, SUPPLIER_STATUS } from 'modules/suppliers/supplier.entity';
import { SupplierRepository } from 'modules/suppliers/supplier.repository';
import { createSupplier } from '../../entity-mocks';
import { expectedJSONAPIAttributes } from './config';
import { saveUserAndGetTokenWithUserId } from '../../utils/userAuth';
import AppSingleton from '../../utils/getApp';
import { clearTestDataFromDatabase } from '../../utils/database-test-helper';
import { DataSource } from 'typeorm';

describe('Suppliers - Get all', () => {
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

  test('Get all suppliers should be successful (happy case)', async () => {
    const supplier: Supplier = await createSupplier();

    const response = await request(app.getHttpServer())
      .get(`/api/v1/suppliers`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.OK);

    expect(response.body.data[0].id).toEqual(supplier.id);
    expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
  });

  test('Get suppliers filtered by some criteria should only return the suppliers that match said criteria', async () => {
    const supplierOne: Supplier = await createSupplier({
      name: 'supplier one',
      status: SUPPLIER_STATUS.ACTIVE,
    });
    const supplierTwo: Supplier = await createSupplier({
      name: 'supplier two',
      status: SUPPLIER_STATUS.ACTIVE,
    });
    await createSupplier({
      name: 'supplier three',
      status: SUPPLIER_STATUS.DELETED,
    });

    const response = await request(app.getHttpServer())
      .get(`/api/v1/suppliers`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        filter: {
          status: SUPPLIER_STATUS.ACTIVE,
        },
      })
      .send()
      .expect(HttpStatus.OK);

    expect(response.body.data).toHaveLength(2);
    expect(response.body.data.map((e: any) => e.id)).toEqual([
      supplierOne.id,
      supplierTwo.id,
    ]);

    expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
  });

  test('Get suppliers in pages should return a partial list of suppliers', async () => {
    await Promise.all(Array.from(Array(10).keys()).map(() => createSupplier()));

    const responseOne = await request(app.getHttpServer())
      .get(`/api/v1/suppliers`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        page: {
          size: 3,
        },
      })
      .send()
      .expect(HttpStatus.OK);

    expect(responseOne.body.data).toHaveLength(3);
    expect(responseOne).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);

    const responseTwo = await request(app.getHttpServer())
      .get(`/api/v1/suppliers`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        page: {
          size: 3,
          number: 4,
        },
      })
      .send()
      .expect(HttpStatus.OK);

    expect(responseTwo.body.data).toHaveLength(1);
    expect(responseTwo).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
  });

  test('Get suppliers and include children should return a list of suppliers and their nested children', async () => {
    const rootSupplier: Supplier = await createSupplier();
    const childOneSupplier: Supplier = await createSupplier({
      parent: rootSupplier,
    });
    const childTwoSupplier: Supplier = await createSupplier({
      parent: rootSupplier,
    });

    const response = await request(app.getHttpServer())
      .get(`/api/v1/suppliers`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        include: 'children',
      })
      .send()
      .expect(HttpStatus.OK);

    expect(response.body.data).toHaveLength(3);
    expect(
      response.body.data.map((elem: Record<string, any>) => elem.id).sort(),
    ).toEqual(
      [rootSupplier.id, childTwoSupplier.id, childOneSupplier.id].sort(),
    );
    expect(response).toHaveJSONAPIAttributes([
      ...expectedJSONAPIAttributes,
      'children',
    ]);

    const rootSupplierFromResponse: Record<string, any> =
      response.body.data.find(
        (elem: Record<string, any>) => elem.id === rootSupplier.id,
      );

    expect(rootSupplierFromResponse.attributes.children).toHaveLength(2);
    expect(
      rootSupplierFromResponse.attributes.children
        .map((elem: Record<string, any>) => elem.id)
        .sort(),
    ).toEqual([childTwoSupplier.id, childOneSupplier.id].sort());
  });
});

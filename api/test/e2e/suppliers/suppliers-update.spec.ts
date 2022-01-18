import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { SuppliersModule } from 'modules/suppliers/suppliers.module';
import { SupplierRepository } from 'modules/suppliers/supplier.repository';
import { createSupplier } from '../../entity-mocks';
import { expectedJSONAPIAttributes } from './config';
import { saveUserAndGetToken } from '../../utils/userAuth';
import { getApp } from '../../utils/getApp';

describe('Suppliers - Update', () => {
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
    jwtToken = await saveUserAndGetToken(moduleFixture, app);
  });

  afterEach(async () => {
    await supplierRepository.delete({});
  });

  afterAll(async () => {
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

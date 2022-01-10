import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { SuppliersModule } from 'modules/suppliers/suppliers.module';
import { SupplierRepository } from 'modules/suppliers/supplier.repository';
import { expectedJSONAPIAttributes } from './config';
import { E2E_CONFIG } from '../../e2e.config';

describe('Suppliers - Get by id', () => {
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

  describe('Suppliers - Get by id', () => {
    test('Get a supplier by id should be successful (happy case)', async () => {
      const supplier: Supplier = new Supplier();
      supplier.name = 'test supplier';
      await supplier.save();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/suppliers/${supplier.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toEqual(supplier.id);
      expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
    });
  });
});

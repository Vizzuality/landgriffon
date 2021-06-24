import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { SuppliersModule } from 'modules/suppliers/suppliers.module';
import { SupplierRepository } from 'modules/suppliers/supplier.repository';

/**
 * Tests for the SuppliersModule.
 */

describe('SuppliersModule (e2e)', () => {
  let app: INestApplication;
  let supplierRepository: SupplierRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, SuppliersModule],
    }).compile();

    supplierRepository = moduleFixture.get<SupplierRepository>(
      SupplierRepository,
    );

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await supplierRepository.delete({});
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  describe('Suppliers - Create', () => {
    test('Create a supplier should be successful (happy case)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/suppliers')
        .send({
          name: 'test supplier',
        })
        .expect(HttpStatus.CREATED);

      const createdSupplier = await supplierRepository.findOne(
        response.body.data.id,
      );

      if (!createdSupplier) {
        throw new Error('Error loading created Supplier');
      }

      expect(createdSupplier.name).toEqual('test supplier');
    });
  });

  describe('Suppliers - Update', () => {
    test('Update a supplier should be successful (happy case)', async () => {
      const supplier: Supplier = new Supplier();
      supplier.name = 'test supplier';
      await supplier.save();

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/suppliers/${supplier.id}`)
        .send({
          name: 'updated test supplier',
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.attributes.name).toEqual(
        'updated test supplier',
      );
    });
  });

  describe('Suppliers - Delete', () => {
    test('Delete a supplier should be successful (happy case)', async () => {
      const supplier: Supplier = new Supplier();
      supplier.name = 'test supplier';
      await supplier.save();

      await request(app.getHttpServer())
        .delete(`/api/v1/suppliers/${supplier.id}`)
        .send()
        .expect(HttpStatus.OK);

      expect(await supplierRepository.findOne(supplier.id)).toBeUndefined();
    });
  });

  describe('Suppliers - Get all', () => {
    test('Get all suppliers should be successful (happy case)', async () => {
      const supplier: Supplier = new Supplier();
      supplier.name = 'test supplier';
      await supplier.save();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/suppliers`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data[0].id).toEqual(supplier.id);
    });
  });

  describe('Suppliers - Get by id', () => {
    test('Get a supplier by id should be successful (happy case)', async () => {
      const supplier: Supplier = new Supplier();
      supplier.name = 'test supplier';
      await supplier.save();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/suppliers/${supplier.id}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toEqual(supplier.id);
    });
  });
});

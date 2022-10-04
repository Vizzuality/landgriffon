import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'app.module';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { SuppliersModule } from 'modules/suppliers/suppliers.module';
import { SupplierRepository } from 'modules/suppliers/supplier.repository';
import { createSupplier } from '../../entity-mocks';
import { SuppliersService } from 'modules/suppliers/suppliers.service';

describe('suppliers - Get descendants by supplier Ids', () => {
  let supplierRepository: SupplierRepository;
  let suppliersService: SuppliersService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, SuppliersModule],
    }).compile();

    supplierRepository =
      moduleFixture.get<SupplierRepository>(SupplierRepository);
    suppliersService = moduleFixture.get(SuppliersService);

    await supplierRepository.delete({});
  });

  afterEach(async () => {
    await supplierRepository.delete({});
  });

  test('Get Supplier descendants ids service should return ids of the requested suppliers and the ids of their descendants', async () => {
    const supplier1: Supplier = await createSupplier({
      name: 'supplier 1',
    });
    const supplier1Level1Descendant1: Supplier = await createSupplier({
      name: 'supplier 1 Level 1 Descendant 1',
      parent: supplier1,
    });
    const supplier1Level1Descendant2: Supplier = await createSupplier({
      name: 'supplier 1 Level 1 Descendant 2',
      parent: supplier1,
    });

    const supplier1Level2Descendant1: Supplier = await createSupplier({
      name: 'supplier 1 Level 2 Descendant 1',
      parent: supplier1Level1Descendant1,
    });
    const supplier1Level2Descendant2: Supplier = await createSupplier({
      name: 'supplier 1 Level 2 Descendant 2',
      parent: supplier1Level1Descendant1,
    });

    const supplier1Level2Descendant3: Supplier = await createSupplier({
      name: 'supplier 1 Level 2 Descendant 3',
      parent: supplier1Level1Descendant2,
    });
    const supplier2: Supplier = await createSupplier({
      name: 'supplier 2',
    });
    const supplier2Level1Descendant1: Supplier = await createSupplier({
      name: 'supplier 2 Level 1 Descendant 1',
      parent: supplier2,
    });

    const supplier2Level2Descendant1: Supplier = await createSupplier({
      name: 'supplier 2 GrandChild 1',
      parent: supplier2Level1Descendant1,
    });

    const supplier1AllDescendants: string[] =
      await suppliersService.getSuppliersDescendants([supplier1.id]);

    expect(supplier1AllDescendants.length).toBe(6);
    expect(supplier1AllDescendants).toEqual(
      expect.arrayContaining([
        supplier1.id,
        supplier1Level1Descendant1.id,
        supplier1Level1Descendant2.id,
        supplier1Level2Descendant1.id,
        supplier1Level2Descendant2.id,
        supplier1Level2Descendant3.id,
      ]),
    );

    const suppliersOfLevel2: string[] =
      await suppliersService.getSuppliersDescendants([
        supplier1Level2Descendant2.id,
        supplier1Level2Descendant3.id,
      ]);
    expect(suppliersOfLevel2.length).toBe(2);
    expect(supplier1AllDescendants).toEqual(
      expect.arrayContaining([
        supplier1Level2Descendant2.id,
        supplier1Level2Descendant3.id,
      ]),
    );

    const suppliersOfLevel1: string[] =
      await suppliersService.getSuppliersDescendants([
        supplier1Level1Descendant1.id,
        supplier2Level1Descendant1.id,
      ]);
    expect(suppliersOfLevel1.length).toBe(5);
    expect(suppliersOfLevel1).toEqual(
      expect.arrayContaining([
        supplier1Level1Descendant1.id,
        supplier1Level2Descendant1.id,
        supplier1Level2Descendant2.id,
        supplier2Level1Descendant1.id,
        supplier2Level2Descendant1.id,
      ]),
    );

    const suppliersOfDifferentLevels: string[] =
      await suppliersService.getSuppliersDescendants([
        supplier1Level1Descendant1.id,
        supplier1Level2Descendant3.id,
        supplier2.id,
      ]);
    expect(suppliersOfDifferentLevels.length).toBe(7);
    expect(suppliersOfDifferentLevels).toEqual(
      expect.arrayContaining([
        supplier1Level1Descendant1.id,
        supplier1Level2Descendant1.id,
        supplier1Level2Descendant2.id,
        supplier1Level2Descendant3.id,
        supplier2.id,
        supplier2Level1Descendant1.id,
        supplier2Level2Descendant1.id,
      ]),
    );
  });
});

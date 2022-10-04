import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'app.module';
import { Material } from 'modules/materials/material.entity';
import { MaterialsModule } from 'modules/materials/materials.module';
import { MaterialRepository } from 'modules/materials/material.repository';
import { createMaterial } from '../../entity-mocks';
import { MaterialsService } from 'modules/materials/materials.service';

describe('materials - Get descendants by Material Ids', () => {
  let materialRepository: MaterialRepository;
  let materialsService: MaterialsService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, MaterialsModule],
    }).compile();

    materialRepository =
      moduleFixture.get<MaterialRepository>(MaterialRepository);
    materialsService = moduleFixture.get(MaterialsService);

    await materialRepository.delete({});
  });

  afterEach(async () => {
    await materialRepository.delete({});
  });

  test('Get Material descendants ids service should return ids of the requested Materials and the ids of their descendants', async () => {
    const material1: Material = await createMaterial({
      name: 'Material 1',
    });
    const material1Level1Descendant1: Material = await createMaterial({
      name: 'Material 1 Level 1 Descendant 1',
      parent: material1,
    });
    const material1Level1Descendant2: Material = await createMaterial({
      name: 'Material 1 Level 1 Descendant 2',
      parent: material1,
    });

    const material1Level2Descendant1: Material = await createMaterial({
      name: 'Material 1 Level 2 Descendant 1',
      parent: material1Level1Descendant1,
    });
    const material1Level2Descendant2: Material = await createMaterial({
      name: 'Material 1 Level 2 Descendant 2',
      parent: material1Level1Descendant1,
    });

    const material1Level2Descendant3: Material = await createMaterial({
      name: 'Material 1 Level 2 Descendant 3',
      parent: material1Level1Descendant2,
    });
    const material2: Material = await createMaterial({
      name: 'Material 2',
    });
    const material2Level1Descendant1: Material = await createMaterial({
      name: 'Material 2 Level 1 Descendant 1',
      parent: material2,
    });

    const material2Level2Descendant1: Material = await createMaterial({
      name: 'Material 2 GrandChild 1',
      parent: material2Level1Descendant1,
    });

    const material1AllDescendants: string[] =
      await materialsService.getMaterialsDescendants([material1.id]);

    expect(material1AllDescendants.length).toBe(6);
    expect(material1AllDescendants).toEqual(
      expect.arrayContaining([
        material1.id,
        material1Level1Descendant1.id,
        material1Level1Descendant2.id,
        material1Level2Descendant1.id,
        material1Level2Descendant2.id,
        material1Level2Descendant3.id,
      ]),
    );

    const materialsOfLevel2: string[] =
      await materialsService.getMaterialsDescendants([
        material1Level2Descendant2.id,
        material1Level2Descendant3.id,
      ]);
    expect(materialsOfLevel2.length).toBe(2);
    expect(material1AllDescendants).toEqual(
      expect.arrayContaining([
        material1Level2Descendant2.id,
        material1Level2Descendant3.id,
      ]),
    );

    const materialsOfLevel1: string[] =
      await materialsService.getMaterialsDescendants([
        material1Level1Descendant1.id,
        material2Level1Descendant1.id,
      ]);
    expect(materialsOfLevel1.length).toBe(5);
    expect(materialsOfLevel1).toEqual(
      expect.arrayContaining([
        material1Level1Descendant1.id,
        material1Level2Descendant1.id,
        material1Level2Descendant2.id,
        material2Level1Descendant1.id,
        material2Level2Descendant1.id,
      ]),
    );

    const materialsOfDifferentLevels: string[] =
      await materialsService.getMaterialsDescendants([
        material1Level1Descendant1.id,
        material1Level2Descendant3.id,
        material2.id,
      ]);
    expect(materialsOfDifferentLevels.length).toBe(7);
    expect(materialsOfDifferentLevels).toEqual(
      expect.arrayContaining([
        material1Level1Descendant1.id,
        material1Level2Descendant1.id,
        material1Level2Descendant2.id,
        material1Level2Descendant3.id,
        material2.id,
        material2Level1Descendant1.id,
        material2Level2Descendant1.id,
      ]),
    );
  });
});

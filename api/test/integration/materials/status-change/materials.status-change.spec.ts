import { clearTestDataFromDatabase } from '../../../utils/database-test-helper';
import { createMaterial } from '../../../entity-mocks';
import { DataSource } from 'typeorm';
import ApplicationManager, {
  TestApplication,
} from '../../../utils/application-manager';
import { MaterialsService } from '../../../../src/modules/materials/materials.service';
import {
  Material,
  MATERIALS_STATUS,
} from '../../../../src/modules/materials/material.entity';
import { CreateMaterialDto } from '../../../../src/modules/materials/dto/create.material.dto';

/**
 * @description: LG heavily depends on each Indicator status to calculate impact during either XLSXL Imports or Intervention calculations
 *
 */

describe('Materials - Status (Integration Tests', () => {
  let dataSource: DataSource;
  let testApplication: TestApplication;
  let materialService: MaterialsService;
  beforeAll(async () => {
    testApplication = await ApplicationManager.init();

    materialService = testApplication.get<MaterialsService>(MaterialsService);
    dataSource = testApplication.get<DataSource>(DataSource);
  });

  afterEach(async () => {
    await clearTestDataFromDatabase(dataSource);
  });

  afterAll(() => testApplication.close());

  test('When I provide some HS Codes to activate Materials, Materials matching these HS Codes should be activated', async () => {
    const hsCodeArray: string[] = Array.from(
      { length: 10 },
      (_: any, index: number) => String(index),
    );
    for (const hsCodeId of hsCodeArray) {
      await createMaterial({
        hsCodeId,
        status: MATERIALS_STATUS.INACTIVE,
        name: hsCodeId,
      });
    }

    const materialsToActivate: string[] = hsCodeArray.slice(0, 5);
    const materialsToRemainInactive: string[] = hsCodeArray.slice(5);

    await materialService.activateMaterials(
      materialsToActivate.map(
        (hsCodeId: string) =>
          ({ hsCodeId, status: MATERIALS_STATUS.ACTIVE } as CreateMaterialDto),
      ),
    );

    const allMaterials: Material[] = await materialService.findAllUnpaginated();
    const actives: Material[] = allMaterials.filter(
      (i: Material) => i.status === MATERIALS_STATUS.ACTIVE,
    );
    expect(actives).toHaveLength(materialsToActivate.length);
    actives.forEach((i: Material) =>
      expect(materialsToActivate.includes(i.hsCodeId)).toEqual(true),
    );
    expect(actives).toHaveLength(materialsToActivate.length);
    actives.forEach((i: Material) =>
      expect(materialsToRemainInactive.includes(i.hsCodeId)).toEqual(false),
    );
  });

  test('When I provide some NameCodes to activate Indicators, but there is any match against the ones that are in the DB, Then I should get a error', async () => {
    for (const n of [1, 2, 3, 4]) {
      await createMaterial({
        hsCodeId: `${n}`,
        status: MATERIALS_STATUS.INACTIVE,
        name: `${n}`,
      });
    }

    expect.assertions(1);

    try {
      await materialService.activateMaterials(
        Array.from(
          { length: 10 },
          (_: any, index: number) =>
            ({ hsCodeId: String(index + 5) } as CreateMaterialDto),
        ),
      );
    } catch ({ message }) {
      expect(message).toEqual(
        'No Materials found matching provided hs codes. Unable to calculate impact. Aborting Import',
      );
    }
  });
  test('When there are some Indicators with status active in the DB, Then I should be able to set them Inactive ', async () => {
    for (const _ of [1, 2, 3, 4, 5]) {
      await createMaterial({
        status: MATERIALS_STATUS.ACTIVE,
      });
    }
    await materialService.deactivateAllMaterials();

    const allIndicators: Material[] =
      await materialService.findAllUnpaginated();
    allIndicators.forEach((i: Material) =>
      expect(i.status).toEqual(MATERIALS_STATUS.INACTIVE),
    );
  });
});

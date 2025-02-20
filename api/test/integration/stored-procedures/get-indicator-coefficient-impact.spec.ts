import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { IndicatorCoefficient } from 'modules/indicator-coefficients/indicator-coefficient.entity';
import {
  Indicator,
  INDICATOR_NAME_CODES,
} from 'modules/indicators/indicator.entity';
import { Material } from 'modules/materials/material.entity';
import { DataSource, Repository } from 'typeorm';
import ApplicationManager from '../../utils/application-manager';
import { clearTestDataFromDatabase } from '../../utils/database-test-helper';
import {
  createAdminRegion,
  createIndicator,
  createIndicatorCoefficient,
  createMaterial,
} from '../../entity-mocks';

type QueryResult = [{ value: number }];

describe('Get Indicator Coefficient Impact Tests', () => {
  let dataSource: DataSource;
  let indicatorCoefficientRepository: Repository<IndicatorCoefficient>;
  let savedIndicator: Indicator;
  let savedMaterial: Material;
  let adminRegionChild: AdminRegion;
  let adminRegionParent: AdminRegion;
  let adminRegionGrandparent: AdminRegion;

  beforeAll(async () => {
    const testApplication = await ApplicationManager.init();
    dataSource = testApplication.get<DataSource>(DataSource);
    indicatorCoefficientRepository =
      dataSource.getRepository(IndicatorCoefficient);
    savedIndicator = await createIndicator({
      nameCode: INDICATOR_NAME_CODES.NL,
    });
    savedMaterial = await createMaterial({ name: 'Material A' });

    adminRegionGrandparent = await createAdminRegion({
      name: 'Grandparent Region',
    });

    adminRegionParent = await createAdminRegion({
      name: 'Parent Region',
      parent: adminRegionGrandparent,
    });

    adminRegionChild = await createAdminRegion({
      name: 'Child Region',
      parent: adminRegionParent,
    });
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
  });

  beforeEach(async () => {
    await indicatorCoefficientRepository.clear();
  });

  test('Case 1: Exact match in located region', async () => {
    const coefficient = await createIndicatorCoefficient({
      adminRegion: adminRegionChild,
      material: savedMaterial,
      indicator: savedIndicator,
      value: 1.23,
    });
    const result: QueryResult = await dataSource.query(
      `SELECT public.get_indicator_coefficient_impact('${savedIndicator.nameCode}', '${adminRegionChild.id}', '${savedMaterial.id}') as value;`,
    );
    expect(result[0].value).toEqual(coefficient.value);
  });

  test('Case 2: Value in parent', async () => {
    const coefficient = await createIndicatorCoefficient({
      adminRegion: adminRegionParent,
      material: savedMaterial,
      indicator: savedIndicator,
      value: 2.34,
    });

    const result: QueryResult = await dataSource.query(
      `SELECT public.get_indicator_coefficient_impact('${savedIndicator.nameCode}', '${adminRegionChild.id}', '${savedMaterial.id}') as value;`,
    );
    expect(result[0].value).toEqual(coefficient.value);
  });

  test('Case 3: Value in grandparent', async () => {
    const coefficient = await createIndicatorCoefficient({
      adminRegion: adminRegionGrandparent,
      material: savedMaterial,
      indicator: savedIndicator,
      value: 3.45,
    });

    const result: QueryResult = await dataSource.query(
      `SELECT public.get_indicator_coefficient_impact('${savedIndicator.nameCode}', '${adminRegionChild.id}', '${savedMaterial.id}') as value;`,
    );
    expect(result[0].value).toEqual(coefficient.value);
  });

  test('Case 4: No value in hierarchy, defaulting to global (null admin region)', async () => {
    const coefficient = await createIndicatorCoefficient({
      material: savedMaterial,
      indicator: savedIndicator,
      value: 4.56,
      // Making explicit to readers that there is no Admin Region for this coefficient
      adminRegion: undefined as any,
    });

    const result: QueryResult = await dataSource.query(
      `SELECT public.get_indicator_coefficient_impact('${savedIndicator.nameCode}', '${adminRegionChild.id}', '${savedMaterial.id}') as value;`,
    );
    expect(result[0].value).toEqual(coefficient.value);
  });

  test('Case 5: No value found, returns null', async () => {
    const result: QueryResult = await dataSource.query(
      `SELECT public.get_indicator_coefficient_impact('${savedIndicator.nameCode}', '${adminRegionChild.id}', '${savedMaterial.id}') as value;`,
    );
    expect(result[0].value).toBeNull();
  });
});

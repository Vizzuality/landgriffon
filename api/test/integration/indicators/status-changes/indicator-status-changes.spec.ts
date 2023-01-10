import { clearTestDataFromDatabase } from '../../../utils/database-test-helper';
import {
  Indicator,
  INDICATOR_STATUS,
  INDICATOR_TYPES_NEW,
} from 'modules/indicators/indicator.entity';
import { IndicatorsService } from 'modules/indicators/indicators.service';
import { createIndicator } from '../../../entity-mocks';
import { CreateIndicatorDto } from 'modules/indicators/dto/create.indicator.dto';
import { DataSource } from 'typeorm';
import ApplicationManager, {
  TestApplication,
} from '../../../utils/application-manager';

/**
 * @description: LG heavily depends on each Indicator status to calculate impact during either XLSXL Imports or Intervention calculations
 *
 */

describe('Indicators - Status (Integration Tests', () => {
  let dataSource: DataSource;
  let testApplication: TestApplication;
  let indicatorService: IndicatorsService;
  beforeAll(async () => {
    testApplication = await ApplicationManager.init();

    indicatorService =
      testApplication.get<IndicatorsService>(IndicatorsService);
    dataSource = testApplication.get<DataSource>(DataSource);
  });

  afterEach(async () => {
    await clearTestDataFromDatabase(dataSource);
  });

  afterAll(() => testApplication.close());

  test('When I provide some NameCodes to activate Indicators, Indicators matching these nameCode should be activated', async () => {
    const nameCodeArray: string[] = Object.values(INDICATOR_TYPES_NEW);
    for (const nameCode of nameCodeArray) {
      await createIndicator({
        nameCode,
        status: INDICATOR_STATUS.INACTIVE,
        name: nameCode,
      });
    }

    const indicatorsToActivate: string[] = nameCodeArray.slice(0, 2);
    const indicatorsToRemainInactive: string[] = nameCodeArray.slice(2);

    await indicatorService.activateIndicators(
      indicatorsToActivate.map(
        (nameCode: string) =>
          ({ nameCode, status: INDICATOR_STATUS.ACTIVE } as CreateIndicatorDto),
      ),
    );

    const allIndicators: Indicator[] =
      await indicatorService.findAllUnpaginated();
    const actives: Indicator[] = allIndicators.filter(
      (i: Indicator) => i.status === INDICATOR_STATUS.ACTIVE,
    );
    expect(actives).toHaveLength(indicatorsToActivate.length);
    actives.forEach((i: Indicator) =>
      expect(indicatorsToActivate.includes(i.nameCode)).toEqual(true),
    );
    expect(actives).toHaveLength(indicatorsToActivate.length);
    actives.forEach((i: Indicator) =>
      expect(indicatorsToRemainInactive.includes(i.nameCode)).toEqual(false),
    );
  });

  test('When I provide some NameCodes to activate Indicators, but there is any match against the ones that are in the DB, Then I should get a error', async () => {
    for (const n of [1, 2, 3, 4]) {
      await createIndicator({
        nameCode: `${n}`,
        status: INDICATOR_STATUS.INACTIVE,
        name: `${n}`,
      });
    }

    expect.assertions(1);

    try {
      await indicatorService.activateIndicators(
        Object.values(INDICATOR_TYPES_NEW).map(
          (n: string) => ({ nameCode: n } as CreateIndicatorDto),
        ),
      );
    } catch ({ message }) {
      expect(message).toEqual(
        'No Indicators found matching provided NameCodes. Unable to calculate impact. Aborting Import',
      );
    }
  });
  test('When there are some Indicators with status active in the DB, Then I should be able to set them Inactive ', async () => {
    const nameCodeArray: string[] = Object.values(INDICATOR_TYPES_NEW);
    for (const nameCode of nameCodeArray) {
      await createIndicator({
        nameCode,
        status: INDICATOR_STATUS.INACTIVE,
        name: nameCode,
      });
    }
    await indicatorService.resetIndicators();

    const allIndicators: Indicator[] =
      await indicatorService.findAllUnpaginated();
    allIndicators.forEach((i: Indicator) =>
      expect(i.status).toEqual(INDICATOR_STATUS.INACTIVE),
    );
  });
});

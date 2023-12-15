import { impactReportFixtures } from './impactReportFixtures';
import ApplicationManager, {
  TestApplication,
} from '../../../utils/application-manager';
import { DataSource } from 'typeorm';
import { setupTestUser } from '../../../utils/userAuth';
import {
  clearEntityTables,
  clearTestDataFromDatabase,
} from '../../../utils/database-test-helper';
import { Indicator } from '../../../../src/modules/indicators/indicator.entity';

describe('Impact Reports', () => {
  const fixtures = impactReportFixtures();
  let testApplication: TestApplication;
  let jwtToken: string;
  let dataSource: DataSource;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init();

    dataSource = testApplication.get<DataSource>(DataSource);

    ({ jwtToken } = await setupTestUser(testApplication));
  });

  afterEach(async () => {
    await clearEntityTables(dataSource, []);
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
  });
  it('should create an impact report', async () => {
    const { indicators } = await fixtures.GivenSourcingLocationWithImpact();
    const response = await fixtures.WhenIRequestAnImpactReport({
      app: testApplication,
      jwtToken,
      indicatorIds: indicators.map((indicator: Indicator) => indicator.id),
    });

    await fixtures.ThenIShouldGetAnImpactReportAboutProvidedFilters(response);
  });
});

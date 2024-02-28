import { impactReportFixtures } from './impactReportFixtures';
import ApplicationManager, {
  TestApplication,
} from '../../../utils/application-manager';
import { DataSource } from 'typeorm';
import { setupTestUser } from '../../../utils/userAuth';
import { clearTestDataFromDatabase } from '../../../utils/database-test-helper';
import { Indicator } from '../../../../src/modules/indicators/indicator.entity';

describe('Impact Reports', () => {
  const fixtures = impactReportFixtures();
  let testApplication: TestApplication;
  let jwtToken: string;
  let dataSource: DataSource;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init();

    dataSource = testApplication.get<DataSource>(DataSource);
  });
  beforeEach(async () => {
    ({ jwtToken } = await setupTestUser(testApplication));
  });

  afterEach(async () => {
    await clearTestDataFromDatabase(dataSource);
  });

  afterAll(async () => {
    await testApplication.close();
  });
  it('should create an impact report', async () => {
    const { indicators, materials } =
      await fixtures.GivenSourcingLocationWithImpact();
    const response = await fixtures.WhenIRequestAnImpactReport({
      app: testApplication,
      jwtToken,
      indicatorIds: indicators.map((indicator: Indicator) => indicator.id),
    });

    fixtures.ThenIShouldGetAnImpactReportAboutProvidedFilters(response, {
      materials,
    });
  });
  it('should create an actual vs scenario impact report', async () => {
    const { indicator, scenarioIntervention } =
      await fixtures.GivenAScenarioIntervention();
    const response = await fixtures.WhenIRequestAnActualVsScenarioImpactReport({
      app: testApplication,
      jwtToken,
      indicatorIds: [indicator.id],
      comparedScenarioId: scenarioIntervention.scenarioId,
    });

    await fixtures.ThenIShouldGetAnImpactReportAboutProvidedFilters(response, {
      indicators: [indicator],
      isActualVsScenario: true,
    });
  });
  it('should create a scenario vs scenario impact report', async () => {
    const { baseScenario, comparedScenario, indicator } =
      await fixtures.GivenTwoScenarioWithInterventions();
    const response = await fixtures.WhenIRequestAScenarioVsScenarioImpactReport(
      {
        app: testApplication,
        jwtToken,
        baseScenarioId: baseScenario.id,
        comparedScenarioId: comparedScenario.id,
        indicatorIds: [indicator.id],
      },
    );
    await fixtures.ThenIShouldGetAnImpactReportAboutProvidedFilters(response, {
      indicators: [indicator],
      isScenarioVsScenario: true,
    });
  });
});

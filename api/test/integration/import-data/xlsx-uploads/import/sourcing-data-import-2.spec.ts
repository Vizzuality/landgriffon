import { TestManager } from '../../../../utils/test-manager';
import { SourcingDataImportTestManager } from './fixtures';
import { FileService } from '../../../../../src/modules/import-data/file.service';
import {
  MockFileService,
  MockGeoCodingService,
} from '../../../../utils/service-mocks';
import { GeoCodingAbstractClass } from 'modules/geo-coding/geo-coding-abstract-class';

describe('Sourcing Data Correct Import (Integration Tests)', () => {
  let sourcingDataImportTestManager: SourcingDataImportTestManager;

  beforeAll(async () => {
    sourcingDataImportTestManager = await TestManager.load(
      SourcingDataImportTestManager,
      TestManager.buildCustomTestModule()
        .overrideProvider(FileService)
        .useClass(MockFileService)
        .overrideProvider(GeoCodingAbstractClass)
        .useClass(MockGeoCodingService),
    );
  });

  afterEach(async () => {
    await sourcingDataImportTestManager.clearDatabase();
  });
  test('should throw an error if no materials are found when importing the data', async () => {
    const error = await sourcingDataImportTestManager.WhenIImportACorrectFile();
    await sourcingDataImportTestManager.ButThereIsNoBaseDataInThePlatform();
    sourcingDataImportTestManager.ThenAnErrorShouldBeThrown(
      error,
      'No Materials found present in the DB. Please check the LandGriffon installation manual',
    );
  });

  test('Should correctly import a file with no errors in it', async () => {
    await sourcingDataImportTestManager.GivenThereIsBaseDataInThePlatform();
    await sourcingDataImportTestManager.WhenIImportACorrectFile();
    await sourcingDataImportTestManager.ThenAllSourcingLocationsShouldBeImported();
    await sourcingDataImportTestManager.AndImpactRelatedToTheseLocationsShouldBeCalculated();
  });
});

import { ImportValidationTestManager } from './fixtures';
import { TestManager } from '../../../../utils/test-manager';
import { FileService } from '../../../../../src/modules/import-data/file.service';
import { MockFileService } from '../../../../utils/service-mocks';

describe('Sourcing Data Import File Validations', () => {
  let importValidationTestManager: ImportValidationTestManager;

  beforeAll(async () => {
    importValidationTestManager = await TestManager.load(
      ImportValidationTestManager,
      TestManager.buildCustomTestModule()
        .overrideProvider(FileService)
        .useClass(MockFileService),
    );
  });

  beforeEach(async () => {
    await importValidationTestManager.refreshState();
  });

  afterEach(async () => {
    await importValidationTestManager.clearDatabase();
  });

  afterAll(async () => {
    await importValidationTestManager.close();
  });

  describe('Input validations', () => {
    test('should catch all validation errors and return them', async () => {
      const errors: any =
        await importValidationTestManager.WhenIImportAFileWithValidationErrors();
      importValidationTestManager.TheErrorShouldBeAnExcelValidationError(
        errors,
      );
      importValidationTestManager.AndItShouldContainAllTheValidationErrorsOfTheFile(
        errors,
      );
    });
  });
});

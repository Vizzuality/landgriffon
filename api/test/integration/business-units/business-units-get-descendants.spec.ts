import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { BusinessUnitRepository } from 'modules/business-units/business-unit.repository';
import { createBusinessUnit } from '../../entity-mocks';
import { BusinessUnitsService } from 'modules/business-units/business-units.service';
import ApplicationManager, {
  TestApplication,
} from '../../utils/application-manager';

describe('BusinessUnits - Get descendants by BusinessUnit Ids', () => {
  let testApplication: TestApplication;
  let businessUnitRepository: BusinessUnitRepository;
  let businessUnitsService: BusinessUnitsService;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init();

    businessUnitRepository = testApplication.get<BusinessUnitRepository>(
      BusinessUnitRepository,
    );
    businessUnitsService = testApplication.get(BusinessUnitsService);

    await businessUnitRepository.delete({});
  });

  afterEach(async () => {
    await businessUnitRepository.delete({});
  });

  test('Get Business Unit descendants ids service should return ids of the requested BusinessUnits and the ids of their descendants', async () => {
    const businessUnit1: BusinessUnit = await createBusinessUnit({
      name: 'BusinessUnit 1',
    });
    const businessUnit1Level1Descendant1: BusinessUnit =
      await createBusinessUnit({
        name: 'BusinessUnit 1 Level 1 Descendant 1',
        parent: businessUnit1,
      });
    const businessUnit1Level1Descendant2: BusinessUnit =
      await createBusinessUnit({
        name: 'BusinessUnit 1 Level 1 Descendant 2',
        parent: businessUnit1,
      });

    const businessUnit1Level2Descendant1: BusinessUnit =
      await createBusinessUnit({
        name: 'BusinessUnit 1 Level 2 Descendant 1',
        parent: businessUnit1Level1Descendant1,
      });
    const businessUnit1Level2Descendant2: BusinessUnit =
      await createBusinessUnit({
        name: 'BusinessUnit 1 Level 2 Descendant 2',
        parent: businessUnit1Level1Descendant1,
      });

    const businessUnit1Level2Descendant3: BusinessUnit =
      await createBusinessUnit({
        name: 'BusinessUnit 1 Level 2 Descendant 3',
        parent: businessUnit1Level1Descendant2,
      });
    const businessUnit2: BusinessUnit = await createBusinessUnit({
      name: 'BusinessUnit 2',
    });
    const businessUnit2Level1Descendant1: BusinessUnit =
      await createBusinessUnit({
        name: 'BusinessUnit 2 Level 1 Descendant 1',
        parent: businessUnit2,
      });

    const businessUnit2Level2Descendant1: BusinessUnit =
      await createBusinessUnit({
        name: 'BusinessUnit 2 GrandChild 1',
        parent: businessUnit2Level1Descendant1,
      });

    const businessUnit1AllDescendants: string[] =
      await businessUnitsService.getBusinessUnitsDescendants([
        businessUnit1.id,
      ]);

    expect(businessUnit1AllDescendants.length).toBe(6);
    expect(businessUnit1AllDescendants).toEqual(
      expect.arrayContaining([
        businessUnit1.id,
        businessUnit1Level1Descendant1.id,
        businessUnit1Level1Descendant2.id,
        businessUnit1Level2Descendant1.id,
        businessUnit1Level2Descendant2.id,
        businessUnit1Level2Descendant3.id,
      ]),
    );

    const businessUnitsOfLevel2: string[] =
      await businessUnitsService.getBusinessUnitsDescendants([
        businessUnit1Level2Descendant2.id,
        businessUnit1Level2Descendant3.id,
      ]);
    expect(businessUnitsOfLevel2.length).toBe(2);
    expect(businessUnit1AllDescendants).toEqual(
      expect.arrayContaining([
        businessUnit1Level2Descendant2.id,
        businessUnit1Level2Descendant3.id,
      ]),
    );

    const businessUnitsOfLevel1: string[] =
      await businessUnitsService.getBusinessUnitsDescendants([
        businessUnit1Level1Descendant1.id,
        businessUnit2Level1Descendant1.id,
      ]);
    expect(businessUnitsOfLevel1.length).toBe(5);
    expect(businessUnitsOfLevel1).toEqual(
      expect.arrayContaining([
        businessUnit1Level1Descendant1.id,
        businessUnit1Level2Descendant1.id,
        businessUnit1Level2Descendant2.id,
        businessUnit2Level1Descendant1.id,
        businessUnit2Level2Descendant1.id,
      ]),
    );

    const businessUnitsOfDifferentLevels: string[] =
      await businessUnitsService.getBusinessUnitsDescendants([
        businessUnit1Level1Descendant1.id,
        businessUnit1Level2Descendant3.id,
        businessUnit2.id,
      ]);
    expect(businessUnitsOfDifferentLevels.length).toBe(7);
    expect(businessUnitsOfDifferentLevels).toEqual(
      expect.arrayContaining([
        businessUnit1Level1Descendant1.id,
        businessUnit1Level2Descendant1.id,
        businessUnit1Level2Descendant2.id,
        businessUnit1Level2Descendant3.id,
        businessUnit2.id,
        businessUnit2Level1Descendant1.id,
        businessUnit2Level2Descendant1.id,
      ]),
    );
  });
});

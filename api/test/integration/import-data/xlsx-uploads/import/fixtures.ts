import { SourcingDataImportService } from 'modules/import-data/sourcing-data/sourcing-data-import.service';
import {
  Indicator,
  INDICATOR_STATUS,
} from 'modules/indicators/indicator.entity';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { Task } from 'modules/tasks/task.entity';
import {
  createAdminRegion,
  createGeoRegion,
  createTask,
} from '../../../../entity-mocks';
import { TestManager } from '../../../../utils/test-manager';
import {
  createIndicatorsForXLSXImport,
  createMaterialTreeForXLSXImport,
} from '../import-mocks';
import { IndicatorRecord } from '../../../../../src/modules/indicator-records/indicator-record.entity';
import { SourcingRecord } from '../../../../../src/modules/sourcing-records/sourcing-record.entity';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';

export class SourcingDataImportTestManager extends TestManager {
  url: string = '/api/v1/import/sourcing-data';

  constructor(manager: TestManager) {
    super(manager.testApp, manager.jwtToken, manager.dataSource);
  }

  GivenThereIsBaseDataInThePlatform = async (): Promise<any> => {
    await createGeoRegion({ isCreatedByUser: false });
    await createAdminRegion();

    await createMaterialTreeForXLSXImport(this.dataSource);
    await createIndicatorsForXLSXImport(
      this.dataSource,
      indicatorsForXLSXUpload,
    );
  };

  ButThereIsNoBaseDataInThePlatform = async (): Promise<any> => {
    return;
  };

  ThenAnErrorShouldBeThrown = (error: Error, expectedMessage: string): void => {
    expect(error.message).toBe(expectedMessage);
  };

  WhenIImportACorrectFile = async (): Promise<any> => {
    const task: Task = await createTask();
    const sourcingDataImportService = this.testApp.get(
      SourcingDataImportService,
    );
    try {
      await sourcingDataImportService.importSourcingData(
        __dirname + '/api_test_datasheet.xlsx',
        task.id,
      );
    } catch (error) {
      return error;
    }
  };
  ThenAllSourcingLocationsShouldBeImported = async (): Promise<any> => {
    const sourcingLocations: any[] = await this.dataSource
      .getRepository(SourcingLocation)
      .find();
    expect(sourcingLocations.length).toBe(25);
    const sourcingRecords: SourcingRecord[] = await this.dataSource
      .getRepository(SourcingRecord)
      .find();
    expect(sourcingRecords.length).toBe(25 * 10);
  };
  AndImpactRelatedToTheseLocationsShouldBeCalculated =
    async (): Promise<any> => {
      const indicatorRecords: IndicatorRecord[] = await this.dataSource
        .getRepository(IndicatorRecord)
        .find();
      const activeIndicators = await this.dataSource
        .getRepository(Indicator)
        .find({ where: { status: INDICATOR_STATUS.ACTIVE } });
      expect(indicatorRecords.length).toBe(25 * 10 * activeIndicators.length);
    };

  AndAllSuppliersShouldBeImported = async (): Promise<any> => {
    const suppliers: any[] = await this.dataSource
      .getRepository(Supplier)
      .find();
    expect(suppliers.length).toBe(2);
  };
  AndAllBusinessUnitsShouldBeImported = async (): Promise<any> => {
    const businessUnits: any[] = await this.dataSource
      .getRepository(BusinessUnit)
      .find();
    expect(businessUnits.length).toBe(2);
  };
}

const indicatorsForXLSXUpload: any[] = [
  {
    name: 'Land use footprint for production',
    nameCode: 'LF',
    status: 'inactive',
  },
  {
    name: 'Cropland expansion in natural ecosystems',
    nameCode: 'NCE',
    status: 'inactive',
  },
  {
    name: 'Deforestation footprint (sLUC)',
    nameCode: 'DF_SLUC',
    status: 'inactive',
  },
  {
    name: 'GHG emissions from deforestation (sLUC)',
    nameCode: 'GHG_DEF_SLUC',
    status: 'inactive',
  },
  {
    name: 'GHG emissions from farm management',
    nameCode: 'GHG_FARM',
    status: 'inactive',
  },
  {
    name: 'Surface or groundwater use',
    nameCode: 'WU',
    status: 'inactive',
  },
  {
    name: 'Excess surface or groundwater use',
    nameCode: 'UWU',
    status: 'inactive',
  },
  {
    name: 'Freshwater nutrient load assimilation volume',
    nameCode: 'NL',
    status: 'inactive',
  },
  {
    name: 'Excess freshwater nutrient load assimilation volume',
    nameCode: 'ENL',
    status: 'inactive',
  },
  {
    name: 'Biodiversity importance of natural ecosystems converted to cropland (FLII)',
    nameCode: 'FLIL',
    status: 'inactive',
  },
];

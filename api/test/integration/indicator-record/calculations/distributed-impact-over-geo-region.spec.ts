import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { SourcingRecordsWithIndicatorRawData } from 'modules/sourcing-records/dto/sourcing-records-with-indicator-raw-data.dto';
import {
  Indicator,
  INDICATOR_NAME_CODES,
} from 'modules/indicators/indicator.entity';
import { ImpactCalculator } from 'modules/indicator-records/services/impact-calculator.service';
import { IndicatorRecordRepository } from '../../../../src/modules/indicator-records/indicator-record.repository';
import { MaterialsToH3sService } from '../../../../src/modules/materials/materials-to-h3s.service';
import { IndicatorsService } from '../../../../src/modules/indicators/indicators.service';
import { ImpactQueryBuilder } from '../../../../src/modules/indicator-records/services/indicator-dependency-manager.service';
import { CachedDataService } from '../../../../src/modules/cached-data/cached-data.service';
import { ImportProgressTrackerFactory } from '../../../../src/modules/events/import-data-progress/import-progress.tracker.factory';
import { TasksService } from '../../../../src/modules/tasks/tasks.service';

const dummyProvider = { useValue: {} };

describe('ImpactCalculator.updateDistributedImpactOverGeoRegion', () => {
  let impactCalculator: ImpactCalculator;
  let dataSourceMock: Partial<DataSource>;
  let repositoryMock: any;

  beforeEach(async () => {
    repositoryMock = {
      findOneOrFail: jest.fn().mockResolvedValue({ geoRegionId: 'geo1' }),
    };

    dataSourceMock = {
      getRepository: jest.fn().mockReturnValue(repositoryMock),
      query: jest.fn().mockReturnValue(10),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImpactCalculator,
        { provide: DataSource, useValue: dataSourceMock },
        {
          provide: TasksService,
          useValue: {
            taskRepository: {
              findOneOrFail: () => ({
                id: 1,
              }),
            },
            updateImportTask: jest.fn(),
          },
        },
        { provide: IndicatorRecordRepository, ...dummyProvider },
        { provide: MaterialsToH3sService, ...dummyProvider },
        { provide: IndicatorsService, ...dummyProvider },
        { provide: ImpactQueryBuilder, ...dummyProvider },
        { provide: CachedDataService, ...dummyProvider },
        { provide: ImportProgressTrackerFactory, ...dummyProvider },
      ],
    }).compile();

    impactCalculator = module.get<ImpactCalculator>(ImpactCalculator);

    // Mock the procedure query call, which is tested elsewhere
    jest
      .spyOn(impactCalculator, 'getDistributedImpactOverGeoRegion')
      .mockResolvedValue(42);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  test('should update distributedImpact for records with production 0 or null', async () => {
    const testData = [
      {
        sourcingRecordId: 'rec1',
        tonnage: 100,
        year: 2020,
        materialH3DataId: 'mat1',
        sourcingLocationId: 'loc1',
        production: 0, // This record should be processed
      },
      {
        sourcingRecordId: 'rec2',
        tonnage: 200,
        year: 2020,
        materialH3DataId: 'mat2',
        sourcingLocationId: 'loc1',
        production: null as any, // This record should be processed
      },
      {
        sourcingRecordId: 'rec3',
        tonnage: 300,
        year: 2020,
        materialH3DataId: 'mat3',
        sourcingLocationId: 'loc2',
        production: 0, // This record should updated
      },
      {
        sourcingRecordId: 'rec4',
        tonnage: 400,
        year: 2020,
        materialH3DataId: 'mat4',
        sourcingLocationId: 'loc2',
        production: 100, // This record should be ignored
      },
      {
        sourcingRecordId: 'rec3',
        tonnage: 300,
        year: 2020,
        materialH3DataId: 'mat3',
        sourcingLocationId: 'loc2',
        production: 100, // This record should be ignored
      },
    ] as SourcingRecordsWithIndicatorRawData[];

    // Define the indicators to use
    const activeIndicators = [
      { nameCode: INDICATOR_NAME_CODES.WGUWU },
      { nameCode: INDICATOR_NAME_CODES.WU },
    ] as Indicator[];

    const updatedData =
      await impactCalculator.updateDistributedImpactOverGeoRegion(
        testData,
        activeIndicators,
      );

    // We should have the same number of input records
    expect(updatedData).toHaveLength(5);

    const recordsWithDistributedImpact = updatedData.filter(
      (record: SourcingRecordsWithIndicatorRawData) => !record.production,
    );

    const recordsWithNoDistributedImpact = updatedData.filter(
      (record: SourcingRecordsWithIndicatorRawData) => !!record.production,
    );

    expect(recordsWithDistributedImpact).toHaveLength(3);
    expect(recordsWithNoDistributedImpact).toHaveLength(2);

    // Check that the updated impact is only for the active indicators
    recordsWithDistributedImpact.forEach(
      (record: SourcingRecordsWithIndicatorRawData) => {
        expect(record.distributedImpact).toEqual({
          [INDICATOR_NAME_CODES.WGUWU]: 42,
          [INDICATOR_NAME_CODES.WU]: 42,
        });
      },
    );

    // Check that the records with production > 0 have no distributed impact value
    recordsWithNoDistributedImpact.forEach(
      (record: SourcingRecordsWithIndicatorRawData) => {
        expect(record.distributedImpact).toBeUndefined();
      },
    );
  });

  test('should return an empty array if no record has production 0 or null', async () => {
    // Mock data
    const testData = [
      {
        sourcingRecordId: 'rec1',
        tonnage: 100,
        year: 2020,
        materialH3DataId: 'mat1',
        sourcingLocationId: 'loc1',
        production: 50,
      },
      {
        sourcingRecordId: 'rec2',
        tonnage: 200,
        year: 2020,
        materialH3DataId: 'mat2',
        sourcingLocationId: 'loc2',
        production: 100,
      },
    ] as SourcingRecordsWithIndicatorRawData[];

    const activeIndicators = [
      { nameCode: INDICATOR_NAME_CODES.WGUWU },
    ] as Indicator[];

    const updatedData =
      await impactCalculator.updateDistributedImpactOverGeoRegion(
        testData,
        activeIndicators,
      );

    expect(updatedData).toHaveLength(2);
    updatedData.forEach((record: SourcingRecordsWithIndicatorRawData) => {
      expect(record.distributedImpact).toBeUndefined();
    });
  });
});

import {
  IEmailService,
  SendMailDTO,
} from '../../src/modules/notifications/email/email.service.interface';
import { Logger } from '@nestjs/common';
import {
  AlertedGeoregionsBySupplier,
  EUDRAlertDatabaseResult,
  EUDRAlertDates,
  GetAlertSummary,
  IEUDRAlertsRepository,
} from 'modules/eudr-alerts/eudr.repositoty.interface';
import { FileService } from '../../src/modules/import-data/file.service';
import { GeoCodingAbstractClass } from '../../src/modules/geo-coding/geo-coding-abstract-class';
import {
  LOCATION_TYPES,
  SourcingLocation,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';
import { DataSource } from 'typeorm';
import { typeOrmConfig } from '../../src/typeorm.config';

export class MockEmailService implements IEmailService {
  logger: Logger = new Logger(MockEmailService.name);

  // async sendMail(mail: SendMailDTO): Promise<void> {
  //   this.logger.warn(`Email Service mock called... `);
  //   return Promise.resolve();
  // }

  sendMail = jest.fn((mail: SendMailDTO): Promise<void> => Promise.resolve());
}

export class MockAlertRepository implements IEUDRAlertsRepository {
  logger: Logger = new Logger(MockAlertRepository.name);

  getAlerts(): any {
    this.logger.warn(`Alert Repository Mock called... `);
    return new Promise((resolve) => {
      resolve([]);
    });
  }

  getDates(): Promise<EUDRAlertDates[]> {
    return new Promise((resolve) => {
      resolve([]);
    });
  }

  getAlertSummary(dto: GetAlertSummary): Promise<EUDRAlertDatabaseResult[]> {
    return Promise.resolve([]);
  }

  getAlertedGeoRegionsBySupplier(dto: {
    supplierIds: string[];
    startAlertDate: Date;
    endAlertDate: Date;
  }): Promise<AlertedGeoregionsBySupplier[]> {
    return Promise.resolve([]);
  }
}

export class MockFileService extends FileService<any> {
  async deleteDataFromFS(): Promise<void> {
    return;
  }
}

export class MockGeoCodingService extends GeoCodingAbstractClass {
  logger: Logger = new Logger(MockGeoCodingService.name);
  dataSource: DataSource = new DataSource(typeOrmConfig);

  constructor() {
    super();
  }

  async geoCodeLocations(
    sourcingData: SourcingData[],
  ): Promise<{ geoCodedSourcingData: SourcingData[]; errors: any[] }> {
    await this.dataSource.initialize();
    const geoRegion = await this.dataSource.query(`select * from geo_region`);

    if (!geoRegion[0]) {
      throw new Error(
        'Mock GeoRegion not found in DB during tests. Make sure there is one present during test execution',
      );
    }
    const adminRegion = await this.dataSource.query(
      `select * from admin_region`,
    );

    if (!adminRegion[0]) {
      throw new Error(
        'Mock AdminRegion not found in DB during tests. Make sure there is one present during test execution',
      );
    }
    await this.dataSource.destroy();

    return sourcingData.reduce(
      (acc: any, cur: SourcingData) => {
        acc.geoCodedSourcingData.push({
          ...cur,
          adminRegionId: adminRegion[0].id,
          geoRegionId: geoRegion[0].id,
        });
        return acc;
      },
      { geoCodedSourcingData: [], errors: [] },
    );
  }

  geoCodeSourcingLocation(locationInfo: {
    locationAdminRegionInput?: string;
    locationAddressInput?: string;
    locationLatitude?: number;
    locationLongitude?: number;
    locationCountryInput: string;
    locationType: LOCATION_TYPES;
  }): Promise<SourcingLocation> {
    return Promise.resolve(undefined) as any;
  }
}
